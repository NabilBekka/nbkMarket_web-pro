"use client";

import { useState, useEffect } from "react";
import styles from "./LoginForm.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface Props {
  onSwitchForgot: () => void;
  onSuccess: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ onSwitchForgot, onSuccess }: Props) {
  const { t } = useLang();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nbk-pro-remember-email");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  const emailValid = emailRegex.test(email);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPw(true);
    setTouchedEmail(true);
    setServerError("");
    if (!emailValid) return;

    setLoading(true);
    const res = await api.auth.login({ email, password });
    setLoading(false);

    if (res.error) {
      setServerError(t.login.error);
      return;
    }

    if (res.data) {
      if (rememberMe) localStorage.setItem("nbk-pro-remember-email", email);
      else localStorage.removeItem("nbk-pro-remember-email");
      login(res.data.accessToken, res.data.user as Parameters<typeof login>[1]);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{t.login.title}</h2>
      <p className={styles.subtitle}>{t.login.subtitle}</p>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <div className={styles.field}>
        <label className={styles.label}>{t.login.email}</label>
        <input
          type="email"
          className={`${styles.input} ${touchedEmail && !emailValid && email.length > 0 ? styles.inputError : ""}`}
          placeholder={t.login.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouchedEmail(true)}
          required
        />
        {touchedEmail && !emailValid && email.length > 0 && (
          <p className={styles.errorText}>{t.login.emailError}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.login.password}</label>
        <div className={styles.passwordWrap}>
          <input
            type={showPw ? "text" : "password"}
            className={styles.input}
            placeholder={t.login.passwordPlaceholder}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setTouchedPw(true); }}
            required
          />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
            {showPw ? "🙈" : "👁️"}
          </button>
        </div>
        {touchedPw && password.length > 0 && (
          <div className={styles.checks}>
            {Object.entries(checks).map(([k, v]) => (
              <span key={k} className={v ? styles.checkOk : styles.checkFail}>
                {v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.optionsRow}>
        <label className={styles.rememberLabel}>
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={styles.checkbox} />
          {t.login.rememberMe}
        </label>
        <button type="button" className={styles.linkBtn} onClick={onSwitchForgot}>
          {t.login.forgotPassword}
        </button>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "..." : t.login.submit}
      </button>

      <p className={styles.bottomText}>
        {t.login.noAccount}{" "}
        <a href="/create-shop" className={styles.linkBtn}>{t.login.createShop}</a>
      </p>
    </form>
  );
}
