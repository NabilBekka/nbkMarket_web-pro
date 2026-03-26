"use client";

import { useState } from "react";
import styles from "./ForgotPasswordForm.module.css";
import { useLang } from "@/context/LangContext";

interface ForgotPasswordFormProps {
  onSwitchLogin: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm({ onSwitchLogin }: ForgotPasswordFormProps) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);

  const emailValid = emailRegex.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedEmail(true);
    if (!emailValid) return;
    // TODO: API call
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{t.forgot.title}</h2>
      <p className={styles.subtitle}>{t.forgot.subtitle}</p>

      {sent ? (
        <div className={styles.successBox}>
          <p className={styles.successText}>
            ✓ {t.forgot.successStart} <strong>{email}</strong>. {t.forgot.successEnd}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label className={styles.label}>{t.forgot.email}</label>
            <input
              type="email"
              className={`${styles.input} ${touchedEmail && !emailValid && email.length > 0 ? styles.inputError : ""}`}
              placeholder={t.forgot.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouchedEmail(true)}
              required
              autoComplete="email"
            />
            {touchedEmail && !emailValid && email.length > 0 && (
              <p className={styles.errorText}>{t.forgot.emailError}</p>
            )}
          </div>

          <button type="submit" className={styles.submitBtn}>
            {t.forgot.submit}
          </button>
        </>
      )}

      <p className={styles.bottomText}>
        <button type="button" className={styles.linkBtn} onClick={onSwitchLogin}>
          {t.forgot.backToLogin}
        </button>
      </p>
    </form>
  );
}
