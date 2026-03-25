import styles from "./TopProducts.module.css";

interface Product {
  emoji: string;
  emojiBg: string;
  name: string;
  views: number;
  price: string;
  stock: "ok" | "low" | "out";
}

const products: Product[] = [
  { emoji: "👕", emojiBg: "#E3F2FD", name: "T-shirt Premium", views: 45, price: "2 500 DA", stock: "ok" },
  { emoji: "🧥", emojiBg: "#E0F2F1", name: "Veste Cuir Classic", views: 38, price: "12 500 DA", stock: "ok" },
  { emoji: "👖", emojiBg: "#FFF8E1", name: "Jean Slim Homme", views: 32, price: "4 200 DA", stock: "ok" },
  { emoji: "👗", emojiBg: "#FCE4EC", name: "Robe d'été Femme", views: 28, price: "3 800 DA", stock: "out" },
  { emoji: "👟", emojiBg: "#FFF3E0", name: "Baskets Sport 2025", views: 25, price: "8 900 DA", stock: "low" },
];

const stockLabels = {
  ok: "En stock",
  low: "Stock bas",
  out: "Rupture",
};

export default function TopProducts() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Top produits</h3>
        <span className={styles.manage}>Gérer</span>
      </div>

      <div className={styles.list}>
        {products.map((product) => (
          <div key={product.name} className={styles.row}>
            <div
              className={styles.thumb}
              style={{ background: product.emojiBg }}
            >
              {product.emoji}
            </div>
            <div className={styles.info}>
              <p className={styles.name}>{product.name}</p>
              <p className={styles.views}>{product.views} vues</p>
            </div>
            <div className={styles.right}>
              <span className={styles.price}>{product.price}</span>
              <span className={`${styles.stock} ${styles[product.stock]}`}>
                {stockLabels[product.stock]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
