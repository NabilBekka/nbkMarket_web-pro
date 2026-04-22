"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./DashboardProducts.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface Product {
  id: string; title: string; price: number; main_image: string;
  avg_rating: number | null; review_count: number; created_at: string; updated_at: string;
}

const PER_PAGE = 8;

export default function DashboardProducts({ onAddProduct, onViewProduct }: { onAddProduct: () => void; onViewProduct: (id: string) => void }) {
  const { lang, t } = useLang();
  const { accessToken } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Load all products initially
  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      setLoading(true);
      const res = await api.products.getMyProducts(accessToken);
      if (res.data?.products) setAllProducts(res.data.products as unknown as Product[]);
      setLoading(false);
    })();
  }, [accessToken]);

  // Debounced fuzzy search
  useEffect(() => {
    if (!accessToken) return;
    if (search.trim().length === 0) { setSearchResults(null); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const res = await api.products.getMyProducts(accessToken, search.trim(), lang);
      if (res.data?.products) setSearchResults(res.data.products as unknown as Product[]);
    }, 300);
  }, [search, lang, accessToken]);

  // Use search results if searching, otherwise all products
  const baseList = searchResults !== null ? searchResults : allProducts;

  // Apply local filters (price, rating) + sort
  const filtered = useMemo(() => {
    let list = [...baseList];
    const min = parseFloat(priceMin); const max = parseFloat(priceMax);
    if (!isNaN(min)) list = list.filter(p => p.price >= min);
    if (!isNaN(max)) list = list.filter(p => p.price <= max);
    if (ratingFilter > 0) list = list.filter(p => p.avg_rating !== null && p.avg_rating >= ratingFilter);

    // If searching, keep relevance order from server. Otherwise sort locally.
    if (searchResults === null) {
      switch (sort) {
        case "az": list.sort((a, b) => a.title.localeCompare(b.title)); break;
        case "za": list.sort((a, b) => b.title.localeCompare(a.title)); break;
        case "priceAsc": list.sort((a, b) => a.price - b.price); break;
        case "priceDesc": list.sort((a, b) => b.price - a.price); break;
        case "bestRated": list.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)); break;
        case "newest": list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
        case "oldest": list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
        case "lastCommented": list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()); break;
      }
    }
    return list;
  }, [baseList, sort, priceMin, priceMax, ratingFilter, searchResults]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, sort, priceMin, priceMax, ratingFilter]);

  const tp = t.productsPage;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>{t.sidebar.products}</h1>
        <button className={styles.addBtn} onClick={onAddProduct}>{t.dashboard.addProduct}</button>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input type="text" className={styles.searchInput} placeholder={tp.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">{tp.sortNewest}</option>
            <option value="oldest">{tp.sortOldest}</option>
            <option value="az">{tp.sortAZ}</option>
            <option value="za">{tp.sortZA}</option>
            <option value="priceAsc">{tp.sortPriceAsc}</option>
            <option value="priceDesc">{tp.sortPriceDesc}</option>
            <option value="bestRated">{tp.sortBestRated}</option>
            <option value="lastCommented">{tp.sortLastCommented}</option>
          </select>
        </div>
        <div className={styles.filtersRow}>
          <div className={styles.priceFilter}>
            <input type="number" className={styles.priceInput} placeholder={tp.priceMin} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} min="0" />
            <span className={styles.priceSep}>—</span>
            <input type="number" className={styles.priceInput} placeholder={tp.priceMax} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} min="0" />
            <span className={styles.priceCurrency}>DA</span>
          </div>
          <div className={styles.ratingFilter}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} type="button" className={`${styles.starBtn} ${ratingFilter >= star ? styles.starActive : ""}`} onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)}>★</button>
            ))}
            {ratingFilter > 0 && <button className={styles.clearRating} onClick={() => setRatingFilter(0)}>✕</button>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingText}>...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyText}>{tp.noProducts}</div>
      ) : (
        <div className={styles.cardsGrid}>
          {paginated.map(p => (
            <button key={p.id} className={styles.card} onClick={() => onViewProduct(p.id)}>
              <img src={p.main_image} alt={p.title} className={styles.cardImage} onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23f0f0f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ccc' font-size='40'>📷</text></svg>"; }} />
              <div className={styles.cardBody}>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.cardPrice}>{p.price.toLocaleString()} DA</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`${styles.pageBtn} ${p === safePage ? styles.pageBtnActive : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
