"use client";
import { useLang } from "@/context/LangContext";
import styles from "@/components/Dashboard.module.css";

export default function ContactsPage() {
  const { t } = useLang();
  return (
    <div className={styles.placeholder}>
      <span className={styles.placeholderIcon}>📇</span>
      <h1 className={styles.placeholderTitle}>{t.sidebar.contacts}</h1>
      <p className={styles.placeholderText}>{t.dashboard.placeholder}</p>
    </div>
  );
}
