import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import ContactsTable from "@/components/ContactsTable";
import TopProducts from "@/components/TopProducts";
import styles from "./page.module.css";

const stats = [
  { label: "Vues ce mois", value: "4 821", change: "↑ 18% vs mois dernier", changeType: "up" as const },
  { label: "Contacts reçus", value: "127", change: "↑ 24%", changeType: "up" as const },
  { label: "Produits actifs", value: "48", change: "3 en rupture", changeType: "neutral" as const },
  { label: "Note moyenne", value: "⭐ 4.8", change: "127 avis", changeType: "neutral" as const },
];

export default function Home() {
  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <div className={styles.welcome}>
            <h1>Bonjour Karim 👋</h1>
            <p>El Yasmine Store · Alger Centre</p>
          </div>
          <button className={styles.newProductBtn}>＋ Nouveau produit</button>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className={styles.columns}>
          <ContactsTable />
          <TopProducts />
        </div>
      </main>
    </div>
  );
}
