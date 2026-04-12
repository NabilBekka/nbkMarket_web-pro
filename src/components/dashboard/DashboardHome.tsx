"use client";
import styles from "./DashboardHome.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";

// Mock data — will be replaced by API calls later
const mockStats = { views: 4821, viewsPercent: 18, contacts: 127, contactsPercent: 24, products: 48, outOfStock: 3, avgRating: 4.8, reviewCount: 127 };
const mockContacts = [
  { name: "Amina B.", product: "T-shirt Premium", type: "Message", status: "new" },
  { name: "Youcef M.", product: "Jean Slim", type: "Appel", status: "pending" },
  { name: "Sara K.", product: "Robe d'été", type: "Déplacement", status: "done" },
];
const mockTopProducts = [
  { name: "T-shirt Premium", views: 45, price: 2500, color: "#4FC3F7" },
  { name: "Veste Cuir", views: 38, price: 12500, color: "#FFB74D" },
  { name: "Jean Slim", views: 32, price: 4200, color: "#7E57C2" },
];

export default function DashboardHome({ onAddProduct }: { onAddProduct: () => void }) {
  const { t } = useLang();
  const { user } = useAuth();

  if (!user) return null;

  const statusLabel = (s: string) => {
    if (s === "new") return t.dashboard.statusNew;
    if (s === "pending") return t.dashboard.statusPending;
    return t.dashboard.statusDone;
  };
  const statusClass = (s: string) => {
    if (s === "new") return styles.badgeNew;
    if (s === "pending") return styles.badgePending;
    return styles.badgeDone;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.greeting}>{t.dashboard.welcome} {user.first_name} 👋</h1>
          <p className={styles.companyName}>{user.company_name}</p>
        </div>
        <button className={styles.addBtn} onClick={onAddProduct}>{t.dashboard.addProduct}</button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t.dashboard.viewsMonth}</span>
          <span className={styles.statValue}>{mockStats.views.toLocaleString()}</span>
          <span className={styles.statTrend}>↑ {mockStats.viewsPercent}% {t.dashboard.vsLastMonth}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t.dashboard.contactsReceived}</span>
          <span className={styles.statValue}>{mockStats.contacts}</span>
          <span className={styles.statTrend}>↑ {mockStats.contactsPercent}%</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t.dashboard.activeProducts}</span>
          <span className={styles.statValue}>{mockStats.products}</span>
          <span className={styles.statWarn}>{mockStats.outOfStock} {t.dashboard.outOfStock}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{t.dashboard.avgRating}</span>
          <span className={styles.statValue}><span className={styles.star}>⭐</span>{mockStats.avgRating}</span>
          <span className={styles.statSub}>{mockStats.reviewCount} {t.dashboard.reviews}</span>
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        {/* Recent contacts */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{t.dashboard.recentContacts}</h2>
            <button className={styles.cardLink}>{t.dashboard.viewAll}</button>
          </div>
          <div className={styles.contactsList}>
            {mockContacts.map((c, i) => (
              <div key={i} className={styles.contactRow}>
                <div>
                  <span className={styles.contactName}>{c.name}</span>
                  <span className={styles.contactMeta}>{c.product} · {c.type}</span>
                </div>
                <span className={`${styles.badge} ${statusClass(c.status)}`}>{statusLabel(c.status)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{t.dashboard.topProducts}</h2>
            <button className={styles.cardLink}>{t.dashboard.manage}</button>
          </div>
          <div className={styles.productsList}>
            {mockTopProducts.map((p, i) => (
              <div key={i} className={styles.productRow}>
                <div className={styles.productThumb} style={{ backgroundColor: `${p.color}20` }}>
                  <span style={{ color: p.color, fontSize: 20 }}>👕</span>
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productViews}>{p.views} {t.dashboard.views}</span>
                </div>
                <span className={styles.productPrice}>{p.price.toLocaleString()} DA</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
