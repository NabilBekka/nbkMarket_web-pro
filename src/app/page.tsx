"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dashboard from "@/components/Dashboard";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function Home() {
  const { t } = useLang();
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) return <Dashboard />;

  return (
    <main>
      <Header />

      <section className={styles.hero}>
        <span className={styles.badge}>{t.landing.badge}</span>
        <h1 className={styles.title}>
          {t.landing.title}
          <br />
          <span className={styles.titleAccent}>{t.landing.titleAccent}</span>
        </h1>
        <p className={styles.subtitle}>{t.landing.subtitle}</p>
        <a href="/create-shop" className={styles.cta}>
          {t.landing.cta}
        </a>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          {t.landing.features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
