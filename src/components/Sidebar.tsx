import styles from "./Sidebar.module.css";

const navItems = [
  { icon: "📊", label: "Dashboard", active: true },
  { icon: "📦", label: "Produits", active: false },
  { icon: "💬", label: "Messages", active: false, badge: 5 },
  { icon: "👥", label: "Contacts", active: false },
  { icon: "⭐", label: "Sponsoring", active: false },
  { icon: "📈", label: "Analytics", active: false },
  { icon: "🏪", label: "Ma boutique", active: false },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        NBK<span className={styles.logoAccent}>Pro</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`${styles.item} ${item.active ? styles.itemActive : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </a>
        ))}
      </nav>

      <div className={styles.bottom}>
        <a href="#" className={styles.item}>
          <span className={styles.icon}>⚙️</span>
          <span>Paramètres</span>
        </a>
      </div>
    </aside>
  );
}
