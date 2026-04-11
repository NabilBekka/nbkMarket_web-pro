"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { User } from "@/context/AuthContext";
import styles from "./page.module.css";

function translateError(err: string, t: any): string {
  if (err.includes("Incorrect password")) return t.settings.saveError;
  if (err.includes("Email already")) return t.register.emailTaken;
  if (err.includes("ompany")) return t.register.companyError;
  return err;
}

export default function SettingsPage() {
  const { lang, t } = useLang();
  const { user, accessToken, updateUser, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState(""); const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showEditPw, setShowEditPw] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false); const [saveError, setSaveError] = useState(""); const [saveLoading, setSaveLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [deletePassword, setDeletePassword] = useState(""); const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteError, setDeleteError] = useState(""); const [showDeleteModal, setShowDeleteModal] = useState(false); const [deleteLoading, setDeleteLoading] = useState(false);

  const handleForgotPassword = async () => { if (!user) return; await api.auth.forgotPassword({ email: user.email, lang }); setForgotSent(true); setTimeout(async () => { await logout(); router.push("/"); }, 3000); };

  if (!user || !accessToken) return <main><Header /><div className={styles.container}><p className={styles.notLogged}>Not logged in</p></div><Footer /></main>;

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

  const pwVal = editValues["new_password"] || "";
  const pwChecks = { length: pwVal.length >= 8, uppercase: /[A-Z]/.test(pwVal), lowercase: /[a-z]/.test(pwVal), number: /[0-9]/.test(pwVal), special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwVal) };
  const pwValid = !editing["new_password"] || Object.values(pwChecks).every(Boolean);

  const handleSave = async () => {
    setSaveSuccess(false); setSaveError("");
    if (!pwValid) return;
    if (!confirmPassword) { setSaveError(t.settings.saveError); return; }
    const updates: Record<string, string> = {}; for (const [k, ed] of Object.entries(editing)) { if (ed && editValues[k] !== undefined && editValues[k] !== "") updates[k] = editValues[k]; }
    if (!Object.keys(updates).length) return;
    setSaveLoading(true); const res = await api.auth.updateProfile(accessToken, { password: confirmPassword, updates }); setSaveLoading(false);
    if (res.error) { setSaveError(translateError(res.error, t)); return; }
    if (res.data?.user) updateUser(res.data.user as User);
    setSaveSuccess(true); setEditing({}); setEditValues({}); setConfirmPassword("");
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true); const res = await api.auth.deleteAccount(accessToken, { password: deletePassword }); setDeleteLoading(false);
    if (res.error) { setShowDeleteModal(false); setDeleteError(translateError(res.error, t)); return; }
    setShowDeleteModal(false); await logout(); router.push("/");
  };

  return (
    <main><Header />
      <div className={styles.container}>
        <a href="/" className={styles.backLink}>{t.settings.back}</a>
        <h1 className={styles.title}>{t.settings.title}</h1>
        {saveSuccess && <div className={styles.successMsgTop}>✓ {t.settings.saveSuccess}</div>}
        {forgotSent && <div className={styles.successMsgTop}>✓ {t.forgot.codeSent}</div>}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.accountInfo}</h2>
          <div className={styles.fieldsList}>
            {fields.map(f => {
              const pwVal = editValues[f.key] || "";
              const pwChecks = f.type === "password" ? {
                length: pwVal.length >= 8,
                uppercase: /[A-Z]/.test(pwVal),
                lowercase: /[a-z]/.test(pwVal),
                number: /[0-9]/.test(pwVal),
                special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwVal),
              } : null;

              return (
                <div key={f.key} className={styles.fieldRow}>
                  <div className={styles.fieldLeft}>
                    <span className={styles.fieldLabel}>{f.label}</span>
                    {editing[f.key] ? (
                      f.type === "password" ? (
                        <>
                          <div className={styles.passwordWrap}>
                            <input
                              type={showEditPw ? "text" : "password"}
                              className={styles.fieldInput}
                              value={pwVal}
                              onChange={(e) => setEditValues(p => ({ ...p, [f.key]: e.target.value }))}
                              autoFocus
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowEditPw(!showEditPw)}>
                              {showEditPw ? "🙈" : "👁️"}
                            </button>
                          </div>
                          {pwVal.length > 0 && pwChecks && (
                            <div className={styles.checks}>
                              {Object.entries(pwChecks).map(([k, v]) => (
                                <span key={k} className={v ? styles.checkOk : styles.checkFail}>
                                  {v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <input
                          type={f.type === "email" ? "email" : "text"}
                          className={styles.fieldInput}
                          value={pwVal}
                          onChange={(e) => setEditValues(p => ({ ...p, [f.key]: e.target.value }))}
                          autoFocus
                        />
                      )
                    ) : (
                      <span className={styles.fieldValue}>{f.value}</span>
                    )}
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
            <button className={styles.saveBtn} onClick={handleSave} disabled={saveLoading || !pwValid}>{saveLoading ? "..." : t.settings.save}</button>
            {saveError && <p className={styles.errorMsg}>{saveError}</p>}
          </div>}
        </section>
        <section className={styles.dangerSection}>
          <h2 className={styles.dangerTitle}>{t.settings.deleteAccount}</h2><p className={styles.dangerText}>{t.settings.deleteWarning}</p>
          <label className={styles.confirmLabel}>{t.settings.deletePassword}</label>
          <div className={styles.passwordWrap}><input type={showDeletePw ? "text" : "password"} className={styles.confirmInput} placeholder={t.settings.deletePasswordPlaceholder} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} /><button type="button" className={styles.eyeBtn} onClick={() => setShowDeletePw(!showDeletePw)}>{showDeletePw ? "🙈" : "👁️"}</button></div>
          <a href="#" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>{t.settings.forgotPassword}</a>
          {deleteError && <p className={styles.errorMsg}>{deleteError}</p>}
          <button className={styles.deleteBtn} onClick={() => { if (!deletePassword) { setDeleteError(t.settings.deleteError); return; } setDeleteError(""); setShowDeleteModal(true); }}>{t.settings.deleteBtn}</button>
        </section>
      </div>
      <Footer />
      {showDeleteModal && <div className={styles.overlay} onClick={() => setShowDeleteModal(false)}><div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{t.settings.deleteModalTitle}</h3><p className={styles.modalText}>{t.settings.deleteModalText}</p>
        <div className={styles.modalActions}><button className={styles.modalCancel} onClick={() => setShowDeleteModal(false)}>{t.settings.deleteModalCancel}</button><button className={styles.modalConfirm} onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? "..." : t.settings.deleteModalConfirm}</button></div>
      </div></div>}
    </main>
  );
}
