"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useLang } from "@/context/LangContext";

const menuItems = [
  { key: "dashboard", icon: "📊", href: "/dashboard" },
  { key: "products", icon: "📦", href: "/products" },
  { key: "messages", icon: "💬", href: "/messages" },
  { key: "contacts", icon: "📇", href: "/contacts" },
  { key: "sponsoring", icon: "⭐", href: "/sponsoring" },
  { key: "analytics", icon: "📈", href: "/analytics" },
  { key: "myShop", icon: "🏪", href: "/my-shop" },
];

export default function Sidebar() {
  const { t } = useLang();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        NBK<span className={styles.logoAccent}>Pro</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map(item => (
          <Link
            key={item.key}
            href={item.href}
            className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{t.sidebar[item.key as keyof typeof t.sidebar]}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <Link
          href="/settings"
          className={`${styles.navItem} ${isActive("/settings") ? styles.navItemActive : ""}`}
        >
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navLabel}>{t.sidebar.settings}</span>
        </Link>
      </div>
    </aside>
  );
}
