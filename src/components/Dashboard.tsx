"use client";
import { useState } from "react";
import Sidebar, { SidebarPage } from "./Sidebar";
import DashboardHome from "./dashboard/DashboardHome";
import DashboardSettings from "./dashboard/DashboardSettings";
import styles from "./Dashboard.module.css";
import { useLang } from "@/context/LangContext";

type Page = SidebarPage | "addProduct";

const placeholderIcons: Record<string, string> = {
  products: "📦", messages: "💬", contacts: "📇",
  sponsoring: "⭐", analytics: "📈", myShop: "🏪",
};

export default function Dashboard() {
  const [page, setPage] = useState<Page>("dashboard");
  const { t } = useLang();

  const sidebarActive: SidebarPage = page === "addProduct" ? "products" : page as SidebarPage;

  const handleNavigate = (p: SidebarPage) => { setPage(p); };

  return (
    <div className={styles.layout}>
      <Sidebar active={sidebarActive} onNavigate={handleNavigate} />
      <main className={styles.content}>
        {page === "dashboard" && (
          <DashboardHome onAddProduct={() => setPage("addProduct")} />
        )}
        {page === "settings" && (
          <DashboardSettings />
        )}
        {page === "addProduct" && (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📦</span>
            <h1 className={styles.placeholderTitle}>{t.dashboard.addProduct}</h1>
            <p className={styles.placeholderText}>{t.dashboard.placeholder}</p>
          </div>
        )}
        {page !== "dashboard" && page !== "settings" && page !== "addProduct" && (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>{placeholderIcons[page] || "📋"}</span>
            <h1 className={styles.placeholderTitle}>{t.sidebar[page as keyof typeof t.sidebar]}</h1>
            <p className={styles.placeholderText}>{t.dashboard.placeholder}</p>
          </div>
        )}
      </main>
    </div>
  );
}
