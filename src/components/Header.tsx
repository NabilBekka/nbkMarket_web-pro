"use client";

import { useState } from "react";
import styles from "./Header.module.css";
import AuthModal from "./AuthModal";
import { useLang } from "@/context/LangContext";

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const { lang, setLang, t } = useLang();

  return (
    <>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          NBK<span className={styles.logoAccent}>Pro</span>
        </a>

        <div className={styles.right}>
          <button className={styles.loginBtn} onClick={() => setShowAuth(true)}>
            {t.header.login}
          </button>
          <div className={styles.langSwitch}>
            <button
              className={`${styles.langBtn} ${lang === "en" ? styles.langActive : ""}`}
              onClick={() => setLang("en")}
              title="English"
            >
              <svg width="20" height="14" viewBox="0 0 60 42" className={styles.flag}>
                <rect width="60" height="42" fill="#012169"/>
                <path d="M0,0 L60,42 M60,0 L0,42" stroke="#fff" strokeWidth="7"/>
                <path d="M0,0 L60,42 M60,0 L0,42" stroke="#C8102E" strokeWidth="4"/>
                <path d="M30,0 V42 M0,21 H60" stroke="#fff" strokeWidth="11"/>
                <path d="M30,0 V42 M0,21 H60" stroke="#C8102E" strokeWidth="7"/>
              </svg>
            </button>
            <button
              className={`${styles.langBtn} ${lang === "fr" ? styles.langActive : ""}`}
              onClick={() => setLang("fr")}
              title="Français"
            >
              <svg width="20" height="14" viewBox="0 0 60 42" className={styles.flag}>
                <rect width="20" height="42" fill="#002395"/>
                <rect x="20" width="20" height="42" fill="#fff"/>
                <rect x="40" width="20" height="42" fill="#ED2939"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
