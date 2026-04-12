"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { User } from "@/context/AuthContext";
import styles from "./DashboardSettings.module.css";

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pwTest = {
  length: (v: string) => v.length >= 8,
  uppercase: (v: string) => /[A-Z]/.test(v),
  lowercase: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
  special: (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v),
};

function translateError(err: string, t: any): string {
  if (err.includes("Incorrect password")) return t.settings.saveError;
  if (err.includes("Email already")) return t.createShop.emailTaken;
  if (err.includes("ompany")) return t.createShop.companyError;
  return err;
}

export default function DashboardSettings() {
  const { lang, setLang, t } = useLang();
  const { user, accessToken, updateUser, logout } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showEditPw, setShowEditPw] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"code" | "done">("code");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPw, setForgotNewPw] = useState("");
  const [showForgotNewPw, setShowForgotNewPw] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const forgotPwChecks = Object.fromEntries(Object.entries(pwTest).map(([k, fn]) => [k, fn(forgotNewPw)]));
  const forgotPwValid = Object.values(forgotPwChecks).every(Boolean);

  const handleLangChange = (newLang: "en" | "fr") => {
    setLang(newLang);
    if (user && accessToken) api.auth.updateLang(accessToken, { lang: newLang });
  };

  const handleForgotPassword = async () => {
    if (!user) return;
    await api.auth.forgotPassword({ email: user.email, lang });
    setForgotCode(""); setForgotNewPw(""); setForgotError(""); setForgotStep("code"); setShowForgotModal(true);
  };

  const handleForgotReset = async () => {
    if (!user || forgotCode.length !== 6 || !forgotPwValid) return;
    setForgotError(""); setForgotLoading(true);
    const res = await api.auth.resetPassword({ email: user.email, code: forgotCode, password: forgotNewPw });
    setForgotLoading(false);
    if (res.error) { setForgotError(t.forgot.codeError); return; }
    setForgotStep("done");
  };

  const handleLogout = async () => { await logout(); router.push("/"); };

  if (!user || !accessToken) return null;

  const fields = [
    { key: "first_name", label: t.settings.firstName, value: user.first_name },
    { key: "last_name", label: t.settings.lastName, value: user.last_name },
    { key: "company_name", label: t.settings.companyName, value: user.company_name },
    { key: "id", label: t.settings.id, value: user.id.slice(0, 8).toUpperCase(), editable: false },
    { key: "email", label: t.settings.email, value: user.email, type: "email" },
    { key: "new_password", label: t.settings.password, value: t.settings.passwordHidden, type: "password" },
  ];

  const startEdit = (key: string, val: string) => { setEditing(p => ({ ...p, [key]: true })); setEditValues(p => ({ ...p, [key]: key === "new_password" ? "" : val })); setSaveSuccess(false); setSaveError(""); };
  const cancelEdit = (key: string) => { setEditing(p => ({ ...p, [key]: false })); setEditValues(p => { const c = { ...p }; delete c[key]; return c; }); };
  const hasEdits = Object.values(editing).some(Boolean);

  function isFieldValid(key: string): boolean {
    if (!editing[key]) return true;
    const val = editValues[key] || "";
    if (val === "") return false;
    if (key === "first_name" || key === "last_name") return nameRegex.test(val);
    if (key === "company_name") return val.length >= 2;
    if (key === "email") return emailRegex.test(val);
    if (key === "new_password") return Object.values(pwTest).every(fn => fn(val));
    return true;
  }

  const allFieldsValid = Object.keys(editing).filter(k => editing[k]).every(k => isFieldValid(k));
  const pwVal = editValues["new_password"] || "";
  const pwChecks = Object.fromEntries(Object.entries(pwTest).map(([k, fn]) => [k, fn(pwVal)]));

  const handleSave = async () => {
    setSaveSuccess(false); setSaveError("");
    if (!allFieldsValid) return;
    if (!confirmPassword) { setSaveError(t.settings.saveError); return; }
    const updates: Record<string, string> = {};
    for (const [k, ed] of Object.entries(editing)) { if (ed && editValues[k] !== undefined && editValues[k] !== "") updates[k] = editValues[k]; }
    if (!Object.keys(updates).length) return;
    setSaveLoading(true);
    const res = await api.auth.updateProfile(accessToken, { password: confirmPassword, updates });
    setSaveLoading(false);
    if (res.error) { setSaveError(translateError(res.error, t)); return; }
    if (res.data?.user) updateUser(res.data.user as User);
    setSaveSuccess(true); setEditing({}); setEditValues({}); setConfirmPassword("");
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    const res = await api.auth.deleteAccount(accessToken, { password: deletePassword });
    setDeleteLoading(false);
    if (res.error) { setShowDeleteModal(false); setDeleteError(translateError(res.error, t)); return; }
    setShowDeleteModal(false); await logout(); router.push("/");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t.sidebar.settings}</h1>

      {/* Language */}
      <section className={styles.section}>
        <div className={styles.langRow}>
          <button className={`${styles.langBtn} ${lang === "en" ? styles.langActive : ""}`} onClick={() => handleLangChange("en")}>🇬🇧 English</button>
          <button className={`${styles.langBtn} ${lang === "fr" ? styles.langActive : ""}`} onClick={() => handleLangChange("fr")}>🇫🇷 Français</button>
        </div>
      </section>

      {/* Account info */}
      {saveSuccess && <div className={styles.successMsg}>✓ {t.settings.saveSuccess}</div>}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.settings.accountInfo}</h2>
        <div className={styles.fieldsList}>
          {fields.map(f => {
            const val = editValues[f.key] || "";
            const valid = isFieldValid(f.key);
            const showErr = editing[f.key] && val.length > 0 && !valid;
            return (
              <div key={f.key} className={styles.fieldRow}>
                <div className={styles.fieldLeft}>
                  <span className={styles.fieldLabel}>{f.label}</span>
                  {editing[f.key] ? (
                    f.type === "password" ? (
                      <>
                        <div className={styles.passwordWrap}>
                          <input type={showEditPw ? "text" : "password"} className={`${styles.fieldInput} ${showErr ? styles.fieldInputError : ""}`} value={val} onChange={(e) => setEditValues(p => ({ ...p, [f.key]: e.target.value }))} autoFocus />
                          <button type="button" className={styles.eyeBtn} onClick={() => setShowEditPw(!showEditPw)}>{showEditPw ? "🙈" : "👁️"}</button>
                        </div>
                        {val.length > 0 && <div className={styles.checks}>{Object.entries(pwChecks).map(([k, v]) => <span key={k} className={v ? styles.checkOk : styles.checkFail}>{v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}</span>)}</div>}
                      </>
                    ) : (
                      <>
                        <input type={f.type === "email" ? "email" : "text"} className={`${styles.fieldInput} ${showErr ? styles.fieldInputError : ""}`} value={val} onChange={(e) => setEditValues(p => ({ ...p, [f.key]: e.target.value }))} autoFocus />
                        {showErr && <p className={styles.fieldErrorText}>{(f.key === "first_name" || f.key === "last_name") ? t.createShop.nameError : f.type === "email" ? t.createShop.emailError : ""}</p>}
                      </>
                    )
                  ) : <span className={styles.fieldValue}>{f.value}</span>}
                </div>
                {f.editable !== false && (editing[f.key]
                  ? <button className={styles.cancelBtn} onClick={() => cancelEdit(f.key)}>{t.settings.cancel}</button>
                  : <button className={styles.editBtn} onClick={() => startEdit(f.key, f.value)}>{t.settings.edit}</button>)}
              </div>
            );
          })}
        </div>
        {hasEdits && <div className={styles.saveSection}>
          <label className={styles.confirmLabel}>{t.settings.confirmPassword}</label>
          <div className={styles.passwordWrap}><input type={showConfirmPw ? "text" : "password"} className={styles.confirmInput} placeholder={t.settings.confirmPasswordPlaceholder} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /><button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPw(!showConfirmPw)}>{showConfirmPw ? "🙈" : "👁️"}</button></div>
          <a href="#" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>{t.settings.forgotPassword}</a>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saveLoading || !allFieldsValid}>{saveLoading ? "..." : t.settings.save}</button>
          {saveError && <p className={styles.errorMsg}>{saveError}</p>}
        </div>}
      </section>

      {/* Delete account */}
      <section className={styles.dangerSection}>
        <h2 className={styles.dangerTitle}>{t.settings.deleteAccount}</h2>
        <p className={styles.dangerText}>{t.settings.deleteWarning}</p>
        <label className={styles.confirmLabel}>{t.settings.deletePassword}</label>
        <div className={styles.passwordWrap}><input type={showDeletePw ? "text" : "password"} className={styles.confirmInput} placeholder={t.settings.deletePasswordPlaceholder} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} /><button type="button" className={styles.eyeBtn} onClick={() => setShowDeletePw(!showDeletePw)}>{showDeletePw ? "🙈" : "👁️"}</button></div>
        <a href="#" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>{t.settings.forgotPassword}</a>
        {deleteError && <p className={styles.errorMsg}>{deleteError}</p>}
        <button className={styles.deleteBtn} onClick={() => { if (!deletePassword) { setDeleteError(t.settings.deleteError); return; } setDeleteError(""); setShowDeleteModal(true); }}>{t.settings.deleteBtn}</button>
      </section>

      {/* Logout */}
      <section className={styles.section}>
        <button className={styles.logoutBtn} onClick={handleLogout}>🚪 {t.header.logout}</button>
      </section>

      {/* Delete modal */}
      {showDeleteModal && <div className={styles.overlay} onClick={() => setShowDeleteModal(false)}><div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{t.settings.deleteModalTitle}</h3><p className={styles.modalText}>{t.settings.deleteModalText}</p>
        <div className={styles.modalActions}><button className={styles.modalCancel} onClick={() => setShowDeleteModal(false)}>{t.settings.deleteModalCancel}</button><button className={styles.modalConfirm} onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? "..." : t.settings.deleteModalConfirm}</button></div>
      </div></div>}

      {/* Forgot modal */}
      {showForgotModal && <div className={styles.overlay} onClick={() => setShowForgotModal(false)}><div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{t.forgot.title}</h3>
        {forgotStep === "done" ? <div><div className={styles.successMsg}>✓ {t.forgot.success}</div><div className={styles.modalActions}><button className={styles.modalCancel} onClick={() => setShowForgotModal(false)}>OK</button></div></div> : <div>
          <p className={styles.modalText}>{t.forgot.codeSent}</p>
          {forgotError && <p className={styles.errorMsg}>{forgotError}</p>}
          <label className={styles.confirmLabel}>{t.forgot.code}</label>
          <input type="text" className={styles.confirmInput} style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px", fontWeight: 700 }} placeholder={t.forgot.codePlaceholder} value={forgotCode} onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" />
          <label className={styles.confirmLabel} style={{ marginTop: 16 }}>{t.forgot.newPassword}</label>
          <div className={styles.passwordWrap}><input type={showForgotNewPw ? "text" : "password"} className={styles.confirmInput} placeholder={t.forgot.newPasswordPlaceholder} value={forgotNewPw} onChange={(e) => setForgotNewPw(e.target.value)} /><button type="button" className={styles.eyeBtn} onClick={() => setShowForgotNewPw(!showForgotNewPw)}>{showForgotNewPw ? "🙈" : "👁️"}</button></div>
          {forgotNewPw.length > 0 && <div className={styles.checks}>{Object.entries(forgotPwChecks).map(([k, v]) => <span key={k} className={v ? styles.checkOk : styles.checkFail}>{v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}</span>)}</div>}
          <div className={styles.modalActions} style={{ marginTop: 16 }}><button className={styles.modalCancel} onClick={() => setShowForgotModal(false)}>{t.settings.deleteModalCancel}</button><button className={styles.modalConfirm} onClick={handleForgotReset} disabled={forgotLoading || forgotCode.length !== 6 || !forgotPwValid}>{forgotLoading ? "..." : t.forgot.resetSubmit}</button></div>
        </div>}
      </div></div>}
    </div>
  );
}
