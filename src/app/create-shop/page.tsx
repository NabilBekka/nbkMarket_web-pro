"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import styles from "./page.module.css";

export default function CreateShop() {
  const { t } = useLang();

  return (
    <main>
      <Header />

      <section className={styles.container}>
        <div className={styles.icon}>🏪</div>
        <h1 className={styles.title}>{t.createShop.title}</h1>
        <p className={styles.subtitle}>{t.createShop.subtitle}</p>
        <a href="/" className={styles.back}>{t.createShop.back}</a>
      </section>

      <Footer />
    </main>
  );
}
