"use client";
import { useState } from "react";
import styles from "./ForgotPasswordForm.module.css";
import { useLang } from "@/context/LangContext";
import { api } from "@/services/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm({ onSwitchLogin }: { onSwitchLogin: () => void }) {
  const { lang, t } = useLang();
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [password, setPassword] = useState(""); const [showPw, setShowPw] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const emailValid = emailRegex.test(email);
  const checks = { length: password.length >= 8, uppercase: /[A-Z]/.test(password), lowercase: /[a-z]/.test(password), number: /[0-9]/.test(password), special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) };
  const allChecks = Object.values(checks).every(Boolean);

  const handleSendCode = async (e: React.FormEvent) => { e.preventDefault(); setTouchedEmail(true); setError(""); if (!emailValid) return; setLoading(true); await api.auth.forgotPassword({ email, lang }); setLoading(false); setStep("code"); };
  const handleReset = async (e: React.FormEvent) => { e.preventDefault(); setError(""); if (code.length !== 6 || !allChecks) return; setLoading(true); const res = await api.auth.resetPassword({ email, code, password }); setLoading(false); if (res.error) { setError(t.forgot.codeError); return; } setStep("done"); };

  return (
    <form onSubmit={step === "email" ? handleSendCode : handleReset} noValidate>
      <h2 className={styles.title}>{t.forgot.title}</h2>
      {step === "email" && <><p className={styles.subtitle}>{t.forgot.subtitle}</p><div className={styles.field}><label className={styles.label}>{t.forgot.email}</label><input type="email" className={`${styles.input} ${touchedEmail && !emailValid && email.length > 0 ? styles.inputError : ""}`} placeholder={t.forgot.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouchedEmail(true)} />{touchedEmail && !emailValid && email.length > 0 && <p className={styles.errorText}>{t.forgot.emailError}</p>}</div><button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? "..." : t.forgot.submit}</button></>}
      {step === "code" && <><p className={styles.subtitle}>{t.forgot.codeSent}</p>{error && <p className={styles.errorBox}>{error}</p>}<div className={styles.field}><label className={styles.label}>{t.forgot.code}</label><input type="text" className={styles.codeInput} placeholder={t.forgot.codePlaceholder} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" /></div><div className={styles.field}><label className={styles.label}>{t.forgot.newPassword}</label><div className={styles.passwordWrap}><input type={showPw ? "text" : "password"} className={styles.input} placeholder={t.forgot.newPasswordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>{showPw ? "🙈" : "👁️"}</button></div>{password.length > 0 && <div className={styles.checks}>{Object.entries(checks).map(([k, v]) => <span key={k} className={v ? styles.checkOk : styles.checkFail}>{v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}</span>)}</div>}</div><button type="submit" className={styles.submitBtn} disabled={loading || code.length !== 6 || !allChecks}>{loading ? "..." : t.forgot.resetSubmit}</button></>}
      {step === "done" && <div className={styles.successBox}><p className={styles.successText}>✓ {t.forgot.success}</p></div>}
      <p className={styles.bottomText}><button type="button" className={styles.linkBtn} onClick={onSwitchLogin}>{t.forgot.backToLogin}</button></p>
    </form>
  );
}
