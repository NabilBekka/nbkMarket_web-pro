"use client";
import styles from "./Sidebar.module.css";
import { useLang } from "@/context/LangContext";

export type SidebarPage = "dashboard" | "products" | "messages" | "contacts" | "sponsoring" | "analytics" | "myShop" | "settings";

const menuItems: { key: SidebarPage; icon: string }[] = [
  { key: "dashboard", icon: "📊" },
  { key: "products", icon: "📦" },
  { key: "messages", icon: "💬" },
  { key: "contacts", icon: "📇" },
  { key: "sponsoring", icon: "⭐" },
  { key: "analytics", icon: "📈" },
  { key: "myShop", icon: "🏪" },
];

export default function Sidebar({ active, onNavigate }: { active: SidebarPage; onNavigate: (page: SidebarPage) => void }) {
  const { t } = useLang();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        NBK<span className={styles.logoAccent}>Pro</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`${styles.navItem} ${active === item.key ? styles.navItemActive : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{t.sidebar[item.key as keyof typeof t.sidebar]}</span>
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button
          className={`${styles.navItem} ${active === "settings" ? styles.navItemActive : ""}`}
          onClick={() => onNavigate("settings")}
        >
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navLabel}>{t.sidebar.settings}</span>
        </button>
      </div>
    </aside>
  );
}
