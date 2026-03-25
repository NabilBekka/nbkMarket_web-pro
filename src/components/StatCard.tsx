import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
}

export default function StatCard({
  label,
  value,
  change,
  changeType,
}: StatCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      <p
        className={`${styles.change} ${
          changeType === "up"
            ? styles.up
            : changeType === "down"
            ? styles.down
            : styles.neutral
        }`}
      >
        {change}
      </p>
    </div>
  );
}
