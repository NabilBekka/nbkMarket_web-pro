"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DashboardMyShop.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { User } from "@/context/AuthContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/merchant").replace(/\/merchant$/, "").replace(/\/api$/, "");

interface Wilaya { code: number; name_fr: string; name_en: string; }
interface Review { id: string; rating: number; comment: string | null; username: string; first_name: string; created_at: string; }

export default function DashboardMyShop() {
  const { lang, t } = useLang();
  const { user, accessToken, updateUser } = useAuth();

  const [allWilayas, setAllWilayas] = useState<Wilaya[]>([]);
  const [deliveryWilayas, setDeliveryWilayas] = useState<Wilaya[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Photo menus
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const coverMenuRef = useRef<HTMLDivElement>(null);

  // Edit modes
  const [editingDesc, setEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [editDelivery69, setEditDelivery69] = useState(false);
  const [editDeliveryList, setEditDeliveryList] = useState<Wilaya[]>([]);
  const [showAddWilayaSearch, setShowAddWilayaSearch] = useState(false);
  const [addWilayaQuery, setAddWilayaQuery] = useState("");
  const addWilayaRef = useRef<HTMLDivElement>(null);

  const wName = (w: Wilaya) => lang === "fr" ? w.name_fr : w.name_en;
  const ts = t.myShop;

  useEffect(() => {
    if (!user || !accessToken) return;
    (async () => {
      setLoading(true);
      const [wRes, dwRes, revRes] = await Promise.all([
        api.wilayas.getAll(),
        api.auth.getDeliveryWilayas(accessToken),
        api.shop.getReviews(user.id),
      ]);
      if (wRes.data?.wilayas) setAllWilayas(wRes.data.wilayas);
      if (dwRes.data?.wilayas) setDeliveryWilayas(dwRes.data.wilayas);
      if (revRes.data) { setReviews(revRes.data.reviews); setAvgRating(revRes.data.avg_rating); setReviewCount(revRes.data.review_count); }
      setLoading(false);
    })();
  }, [user, accessToken]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setShowProfileMenu(false);
      if (coverMenuRef.current && !coverMenuRef.current.contains(e.target as Node)) setShowCoverMenu(false);
      if (addWilayaRef.current && !addWilayaRef.current.contains(e.target as Node)) setShowAddWilayaSearch(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    e.target.value = "";
    const upRes = await api.upload.image(accessToken, file);
    if (!upRes.data?.path) return;
    const fullUrl = `${API_BASE}${upRes.data.path}`;
    const field = type === "profile" ? "profile_image" : "cover_image";
    const res = await api.auth.updateImages(accessToken, { [field]: fullUrl });
    if (res.data?.user) updateUser(res.data.user as unknown as User);
    setShowProfileMenu(false);
    setShowCoverMenu(false);
  };

  // Description edit
  const startEditDesc = () => { setEditDesc(user?.description || ""); setEditingDesc(true); };
  const saveDesc = async () => {
    if (!accessToken) return;
    const res = await api.auth.updateImages(accessToken, { description: editDesc.trim() });
    if (res.data?.user) updateUser(res.data.user as unknown as User);
    setEditingDesc(false);
  };

  // Delivery edit
  const startEditDelivery = () => {
    setEditDelivery69(deliveryWilayas.length >= 69);
    setEditDeliveryList(deliveryWilayas.length >= 69 ? [] : [...deliveryWilayas]);
    setEditingDelivery(true);
  };
  const saveDelivery = async () => {
    if (!accessToken) return;
    const codes = editDelivery69 ? allWilayas.map(w => w.code) : editDeliveryList.map(w => w.code);
    const res = await api.auth.updateDeliveryWilayas(accessToken, codes);
    if (res.data?.wilayas) setDeliveryWilayas(res.data.wilayas);
    setEditingDelivery(false);
  };

  const filteredAddWilayas = allWilayas.filter(w => {
    if (addWilayaQuery.length < 1) return false;
    if (editDeliveryList.some(dw => dw.code === w.code)) return false;
    const q = addWilayaQuery.toLowerCase();
    return w.name_fr.toLowerCase().includes(q) || w.name_en.toLowerCase().includes(q) || w.code.toString() === q;
  }).slice(0, 8);

  if (!user || loading) return <div className={styles.container}><div className={styles.loading}>...</div></div>;

  const shopWilaya = allWilayas.find(w => w.code === user.wilaya_code);

  return (
    <div className={styles.container}>
      {/* Cover + Profile */}
      <div className={styles.coverSection}>
        <div className={styles.coverWrap} ref={coverMenuRef}>
          {user.cover_image ? (
            <img src={user.cover_image} alt="Cover" className={styles.coverImage} onClick={() => setShowCoverMenu(!showCoverMenu)} />
          ) : (
            <div className={styles.coverPlaceholder} onClick={() => setShowCoverMenu(!showCoverMenu)}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
          )}
          {showCoverMenu && (
            <div className={styles.photoMenu} style={{ top: 10, right: 10 }}>
              {user.cover_image && <button className={styles.photoMenuItem} onClick={() => { setViewingImage(user.cover_image!); setShowCoverMenu(false); }}>{ts.viewPhoto}</button>}
              <button className={styles.photoMenuItem} onClick={() => coverInputRef.current?.click()}>{ts.changePhoto}</button>
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png" ref={coverInputRef} className={styles.fileInput} onChange={(e) => onFileSelected(e, "cover")} />
        </div>

        <div className={styles.profileWrap} ref={profileMenuRef}>
          {user.profile_image ? (
            <img src={user.profile_image} alt="Profile" className={styles.profileImage} onClick={() => setShowProfileMenu(!showProfileMenu)} />
          ) : (
            <div className={styles.profilePlaceholder} onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21c0-4.418-3.582-8-8-8s-8 3.582-8 8"/></svg>
            </div>
          )}
          {showProfileMenu && (
            <div className={styles.photoMenu}>
              {user.profile_image && <button className={styles.photoMenuItem} onClick={() => { setViewingImage(user.profile_image!); setShowProfileMenu(false); }}>{ts.viewPhoto}</button>}
              <button className={styles.photoMenuItem} onClick={() => profileInputRef.current?.click()}>{ts.changePhoto}</button>
            </div>
          )}
          <input type="file" accept="image/jpeg,image/png" ref={profileInputRef} className={styles.fileInput} onChange={(e) => onFileSelected(e, "profile")} />
        </div>

        <div className={styles.shopInfo}>
          <h1 className={styles.shopName}>{user.company_name}</h1>
          {user.address && <p className={styles.shopDetail}>📍 {user.address}</p>}
          {shopWilaya && <p className={styles.shopDetail}>{wName(shopWilaya)}</p>}
          {avgRating !== null ? (
            <p className={styles.shopRating}>{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))} {avgRating.toFixed(1)} ({reviewCount} {ts.reviews})</p>
          ) : (
            <p className={styles.shopNoRating}>{ts.notRated}</p>
          )}
        </div>
      </div>

      {/* Delivery */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{ts.delivery}</span>
          {editingDelivery ? (
            <div className={styles.editActions}>
              <button className={styles.editLink} onClick={saveDelivery}>{ts.save}</button>
              <button className={styles.cancelLink} onClick={() => setEditingDelivery(false)}>{ts.cancel}</button>
            </div>
          ) : (
            <button className={styles.editLink} onClick={startEditDelivery}>{ts.edit}</button>
          )}
        </div>
        {editingDelivery ? (
          <div className={styles.editBlock}>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>{ts.delivery69Yes}</span>
              <button className={`${styles.toggleBtn} ${editDelivery69 ? styles.toggleActive : ""}`} onClick={() => { setEditDelivery69(true); setEditDeliveryList([]); }}>{ts.delivery69Yes}</button>
              <button className={`${styles.toggleBtn} ${!editDelivery69 ? styles.toggleActive : ""}`} onClick={() => {
                setEditDelivery69(false);
                const shopW = allWilayas.find(w => w.code === user.wilaya_code);
                setEditDeliveryList(shopW ? [shopW] : []);
              }}>{ts.delivery69No}</button>
            </div>
            {!editDelivery69 && (
              <>
                <p className={styles.maxNote}>{ts.deliveryMax}</p>
                <div className={styles.chipList}>
                  {editDeliveryList.map(w => (
                    <div key={w.code} className={styles.chip}>
                      <span>{w.code} - {wName(w)}</span>
                      {w.code === user.wilaya_code
                        ? <span className={styles.chipLock}>📍</span>
                        : <button className={styles.chipRemove} onClick={() => setEditDeliveryList(prev => prev.filter(dw => dw.code !== w.code))}>✕</button>}
                    </div>
                  ))}
                </div>
                {editDeliveryList.length < 10 && (
                  <div ref={addWilayaRef} style={{ position: "relative" }}>
                    {showAddWilayaSearch ? (
                      <>
                        <input type="text" className={styles.searchInput} placeholder={ts.searchWilaya} value={addWilayaQuery} onChange={(e) => setAddWilayaQuery(e.target.value)} autoFocus />
                        {filteredAddWilayas.length > 0 && (
                          <div className={styles.dropdown}>
                            {filteredAddWilayas.map(w => (
                              <button key={w.code} type="button" className={styles.dropdownItem} onClick={() => { setEditDeliveryList(prev => [...prev, w]); setAddWilayaQuery(""); setShowAddWilayaSearch(false); }}>
                                {w.code} - {wName(w)}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button className={styles.addWilayaBtn} onClick={() => setShowAddWilayaSearch(true)}>{ts.addWilaya}</button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <p className={styles.sectionText}>
            {!user.offers_delivery ? ts.deliveryNone
              : deliveryWilayas.length >= 69 ? ts.delivery69
              : deliveryWilayas.length > 0 ? deliveryWilayas.map(w => wName(w)).join(" · ")
              : ts.deliveryNone}
          </p>
        )}
      </div>

      {/* Description */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{ts.description}</span>
          {editingDesc ? (
            <div className={styles.editActions}>
              <button className={styles.editLink} onClick={saveDesc}>{ts.save}</button>
              <button className={styles.cancelLink} onClick={() => setEditingDesc(false)}>{ts.cancel}</button>
            </div>
          ) : (
            <button className={styles.editLink} onClick={startEditDesc}>{ts.edit}</button>
          )}
        </div>
        {editingDesc ? (
          <textarea className={styles.editTextarea} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder={ts.descPlaceholder} rows={5} autoFocus />
        ) : (
          <p className={styles.sectionText}>{user.description || ts.noDescription}</p>
        )}
      </div>

      {/* Reviews */}
      <div className={styles.section}>
        <span className={styles.sectionLabel}>{ts.reviewsTitle} ({reviewCount})</span>
        {reviews.length === 0 ? (
          <p className={styles.noReviews}>{ts.noReviews}</p>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map(r => (
              <div key={r.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewUser}>{r.first_name} ({r.username})</span>
                  <span className={styles.reviewStars}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image viewer */}
      {viewingImage && (
        <div className={styles.overlay} onClick={() => setViewingImage(null)}>
          <img src={viewingImage} alt="" className={styles.viewerImage} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
