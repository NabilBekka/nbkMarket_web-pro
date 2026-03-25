import styles from "./ContactsTable.module.css";

interface Contact {
  name: string;
  product: string;
  via: string;
  status: "new" | "pending" | "done";
  time: string;
}

const contacts: Contact[] = [
  { name: "Amina B.", product: "T-shirt Premium", via: "Message", status: "new", time: "Il y a 12 min" },
  { name: "Youcef M.", product: "Jean Slim", via: "Appel", status: "pending", time: "Il y a 1h" },
  { name: "Sara K.", product: "Robe d'été", via: "Déplacement", status: "done", time: "Il y a 3h" },
  { name: "Mohamed R.", product: "Veste Cuir", via: "Message", status: "new", time: "Il y a 4h" },
  { name: "Lina D.", product: "Casquette NBK", via: "Appel", status: "done", time: "Hier" },
];

const statusLabels = {
  new: "Nouveau",
  pending: "En attente",
  done: "Conclu",
};

export default function ContactsTable() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Derniers contacts</h3>
        <span className={styles.viewAll}>Voir tout</span>
      </div>

      <div className={styles.list}>
        {contacts.map((contact) => (
          <div key={contact.name + contact.product} className={styles.row}>
            <div className={styles.info}>
              <p className={styles.name}>{contact.name}</p>
              <p className={styles.detail}>
                {contact.product} · {contact.via}
              </p>
            </div>
            <div className={styles.right}>
              <span className={`${styles.badge} ${styles[contact.status]}`}>
                {statusLabels[contact.status]}
              </span>
              <span className={styles.time}>{contact.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
