"use client";
import { useState } from "react";
import Sidebar, { SidebarPage } from "./Sidebar";
import DashboardSettings from "./dashboard/DashboardSettings";
import styles from "./Dashboard.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";

const placeholderIcons: Record<string, string> = {
  dashboard: "📊", products: "📦", messages: "💬", contacts: "📇",
  sponsoring: "⭐", analytics: "📈", myShop: "🏪",
};

export default function Dashboard() {
  const [page, setPage] = useState<SidebarPage>("dashboard");
  const { t } = useLang();
  const { user } = useAuth();

  return (
    <div className={styles.layout}>
      <Sidebar active={page} onNavigate={setPage} />
      <main className={styles.content}>
        {page === "settings" ? (
          <DashboardSettings />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>{placeholderIcons[page]}</span>
            <h1 className={styles.placeholderTitle}>
              {page === "dashboard" && user ? `${t.dashboard.welcome}, ${user.first_name}` : t.sidebar[page as keyof typeof t.sidebar]}
            </h1>
            <p className={styles.placeholderText}>{t.dashboard.placeholder}</p>
          </div>
        )}
      </main>
    </div>
  );
}
