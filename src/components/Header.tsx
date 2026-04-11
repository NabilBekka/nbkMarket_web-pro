"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import AuthModal from "./AuthModal";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { lang, setLang, t } = useLang();
  const { user, accessToken, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false); }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const handleLangChange = (newLang: "en" | "fr") => { setLang(newLang); if (user && accessToken) api.auth.updateLang(accessToken, { lang: newLang }); };
  const handleLogout = async () => { setShowDropdown(false); await logout(); };

  return (
    <>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>NBK<span className={styles.logoAccent}>Pro</span></a>
        <div className={styles.right}>
          {user ? (
            <div className={styles.avatarWrap} ref={dropdownRef}>
              <button className={styles.avatarBtn} onClick={() => setShowDropdown(!showDropdown)}>{user.first_name[0]}{user.last_name[0]}</button>
              {showDropdown && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}><span className={styles.dropdownName}>{user.first_name} {user.last_name}</span><span className={styles.dropdownCompany}>{user.company_name}</span><span className={styles.dropdownEmail}>{user.email}</span></div>
                  <div className={styles.dropdownDivider} />
                  <div className={styles.dropdownLang}><button className={`${styles.dropdownLangBtn} ${lang === "en" ? styles.dropdownLangActive : ""}`} onClick={() => handleLangChange("en")}>🇬🇧 English</button><button className={`${styles.dropdownLangBtn} ${lang === "fr" ? styles.dropdownLangActive : ""}`} onClick={() => handleLangChange("fr")}>🇫🇷 Français</button></div>
                  <div className={styles.dropdownDivider} />
                  <a href="/settings" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>⚙️ {t.header.settings}</a>
                  <button className={styles.dropdownItemDanger} onClick={handleLogout}>🚪 {t.header.logout}</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className={styles.loginBtn} onClick={() => setShowAuth(true)}>{t.header.login}</button>
              <div className={styles.langSwitch}>
                <button className={`${styles.langBtn} ${lang === "en" ? styles.langActive : ""}`} onClick={() => handleLangChange("en")} title="English"><svg width="20" height="14" viewBox="0 0 60 42" className={styles.flag}><rect width="60" height="42" fill="#012169"/><path d="M0,0 L60,42 M60,0 L0,42" stroke="#fff" strokeWidth="7"/><path d="M0,0 L60,42 M60,0 L0,42" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 V42 M0,21 H60" stroke="#fff" strokeWidth="11"/><path d="M30,0 V42 M0,21 H60" stroke="#C8102E" strokeWidth="7"/></svg></button>
                <button className={`${styles.langBtn} ${lang === "fr" ? styles.langActive : ""}`} onClick={() => handleLangChange("fr")} title="Français"><svg width="20" height="14" viewBox="0 0 60 42" className={styles.flag}><rect width="20" height="42" fill="#002395"/><rect x="20" width="20" height="42" fill="#fff"/><rect x="40" width="20" height="42" fill="#ED2939"/></svg></button>
              </div>
            </>
          )}
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
