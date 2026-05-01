"use client";
import { useState } from "react";
import Sidebar, { SidebarPage } from "./Sidebar";
import DashboardHome from "./dashboard/DashboardHome";
import DashboardProducts from "./dashboard/DashboardProducts";
import ProductDetail from "./dashboard/ProductDetail";
import EditProduct from "./dashboard/EditProduct";
import DashboardMyShop from "./dashboard/DashboardMyShop";
import DashboardSettings from "./dashboard/DashboardSettings";
import AddProduct from "./dashboard/AddProduct";
import styles from "./Dashboard.module.css";
import { useLang } from "@/context/LangContext";

type Page = SidebarPage | "addProduct" | "productDetail" | "editProduct";

const placeholderIcons: Record<string, string> = {
  messages: "💬", contacts: "📇",
  sponsoring: "⭐", analytics: "📈",
};

export default function Dashboard() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const { t } = useLang();

  const sidebarActive: SidebarPage =
    page === "addProduct" || page === "productDetail" || page === "editProduct"
      ? "products" : page as SidebarPage;

  const handleNavigate = (p: SidebarPage) => { setPage(p); };

  return (
    <div className={styles.layout}>
      <Sidebar active={sidebarActive} onNavigate={handleNavigate} />
      <main className={styles.content}>
        {page === "dashboard" && (
          <DashboardHome onAddProduct={() => setPage("addProduct")} />
        )}
        {page === "products" && (
          <DashboardProducts
            onAddProduct={() => setPage("addProduct")}
            onViewProduct={(id) => { setSelectedProductId(id); setPage("productDetail"); }}
          />
        )}
        {page === "productDetail" && (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => setPage("products")}
            onEdit={() => setPage("editProduct")}
            onDeleted={() => setPage("products")}
          />
        )}
        {page === "editProduct" && (
          <EditProduct
            productId={selectedProductId}
            onBack={() => setPage("productDetail")}
            onSuccess={() => setPage("productDetail")}
          />
        )}
        {page === "addProduct" && (
          <AddProduct onBack={() => setPage("dashboard")} onSuccess={() => setPage("products")} />
        )}
        {page === "settings" && (
          <DashboardSettings />
        )}
        {page === "myShop" && (
          <DashboardMyShop />
        )}
        {page !== "dashboard" && page !== "products" && page !== "productDetail" && page !== "editProduct" && page !== "addProduct" && page !== "settings" && page !== "myShop" && (
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
