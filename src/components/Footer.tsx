"use client";

import styles from "./Footer.module.css";
import { useLang } from "@/context/LangContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            NBK<span className={styles.logoAccent}>Pro</span>
          </span>
          <p className={styles.desc}>{t.footer.desc}</p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>{t.footer.platform}</h4>
            <a href="#">{t.footer.features}</a>
            <a href="#">{t.footer.pricing}</a>
            <a href="#">{t.footer.faq}</a>
            <a href="#">{t.footer.support}</a>
          </div>
          <div className={styles.col}>
            <h4>{t.footer.resources}</h4>
            <a href="#">{t.footer.helpCenter}</a>
            <a href="#">{t.footer.contact}</a>
            <a href="#">{t.footer.terms}</a>
            <a href="#">{t.footer.privacy}</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
