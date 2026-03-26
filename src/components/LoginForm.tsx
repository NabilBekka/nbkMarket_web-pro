"use client";

import { useState, useEffect } from "react";
import styles from "./LoginForm.module.css";
import { useLang } from "@/context/LangContext";

interface LoginFormProps {
  onSwitchForgot: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ onSwitchForgot }: LoginFormProps) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nbk-pro-remember-email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const emailValid = emailRegex.test(email);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allValid = Object.values(checks).every(Boolean) && emailValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPw(true);
    setTouchedEmail(true);
    if (!allValid) return;

    if (rememberMe) {
      localStorage.setItem("nbk-pro-remember-email", email);
    } else {
      localStorage.removeItem("nbk-pro-remember-email");
    }

    // TODO: API call
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{t.login.title}</h2>
      <p className={styles.subtitle}>{t.login.subtitle}</p>

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
          autoComplete="email"
        />
        {touchedEmail && !emailValid && email.length > 0 && (
          <p className={styles.errorText}>{t.login.emailError}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.login.password}</label>
        <div className={styles.passwordWrap}>
          <input
            type={showPassword ? "text" : "password"}
            className={styles.input}
            placeholder={t.login.passwordPlaceholder}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setTouchedPw(true);
            }}
            required
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {touchedPw && password.length > 0 && (
          <div className={styles.checks}>
            <span className={checks.length ? styles.checkOk : styles.checkFail}>
              {checks.length ? "✓" : "✗"} {t.login.checks.length}
            </span>
            <span className={checks.uppercase ? styles.checkOk : styles.checkFail}>
              {checks.uppercase ? "✓" : "✗"} {t.login.checks.uppercase}
            </span>
            <span className={checks.lowercase ? styles.checkOk : styles.checkFail}>
              {checks.lowercase ? "✓" : "✗"} {t.login.checks.lowercase}
            </span>
            <span className={checks.number ? styles.checkOk : styles.checkFail}>
              {checks.number ? "✓" : "✗"} {t.login.checks.number}
            </span>
            <span className={checks.special ? styles.checkOk : styles.checkFail}>
              {checks.special ? "✓" : "✗"} {t.login.checks.special}
            </span>
          </div>
        )}
      </div>

      <div className={styles.optionsRow}>
        <label className={styles.rememberLabel}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={styles.checkbox}
          />
          {t.login.rememberMe}
        </label>
        <button type="button" className={styles.linkBtn} onClick={onSwitchForgot}>
          {t.login.forgotPassword}
        </button>
      </div>

      <button type="submit" className={styles.submitBtn}>
        {t.login.submit}
      </button>
    </form>
  );
}
