"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProductDetail.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface Product {
  id: string; title: string; description: string; price: number;
  main_image: string; image_2: string | null; image_3: string | null;
  avg_rating: number | null; review_count: number; company_name: string;
  created_at: string;
}
interface Review {
  id: string; rating: number; comment: string | null;
  username: string; first_name: string; created_at: string;
}

export default function ProductDetail({ productId }: { productId: string }) {
  const router = useRouter();
  const { t } = useLang();
  const { accessToken } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        api.products.getById(productId),
        api.products.getReviews(productId),
      ]);
      if (pRes.data?.product) {
        const p = pRes.data.product as unknown as Product;
        setProduct(p);
        setSelectedImage(p.main_image);
      }
      if (rRes.data?.reviews) setReviews(rRes.data.reviews);
      setLoading(false);
    })();
  }, [productId]);

  const handleDelete = async () => {
    if (!accessToken) return;
    setDeleteLoading(true);
    await api.products.remove(accessToken, productId);
    setDeleteLoading(false);
    setShowDeleteModal(false);
    router.push("/products");
  };

  const td = t.productDetail;

  if (loading) return <div className={styles.container}><div className={styles.loading}>...</div></div>;
  if (!product) return <div className={styles.container}><p>{td.notFound}</p></div>;

  const images = [product.main_image, product.image_2, product.image_3].filter(Boolean) as string[];

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.push("/products")}>← {td.back}</button>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={() => router.push(`/products/${productId}/edit`)}>{td.edit}</button>
        <button className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>{td.delete}</button>
      </div>

      <div className={styles.content}>
        {/* Images */}
        <div className={styles.imagesSection}>
          <img src={selectedImage} alt={product.title} className={styles.mainImage} />
          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((img, i) => (
                <img key={i} src={img} alt={`${i + 1}`} className={`${styles.thumb} ${selectedImage === img ? styles.thumbActive : ""}`} onClick={() => setSelectedImage(img)} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.price}>{product.price.toLocaleString()} DA</p>

          {product.avg_rating !== null ? (
            <div className={styles.ratingRow}>
              <span className={styles.ratingStars}>{"★".repeat(Math.round(product.avg_rating))}{"☆".repeat(5 - Math.round(product.avg_rating))}</span>
              <span className={styles.ratingValue}>{product.avg_rating.toFixed(1)}</span>
              <span className={styles.ratingCount}>({product.review_count} {td.reviews})</span>
            </div>
          ) : (
            <p className={styles.noRating}>{td.notRated}</p>
          )}

          <div className={styles.descSection}>
            <h3 className={styles.descLabel}>{td.description}</h3>
            <p className={styles.descText}>{product.description}</p>
          </div>

          <p className={styles.dateText}>{td.addedOn} {new Date(product.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Reviews */}
      <div className={styles.reviewsSection}>
        <h2 className={styles.reviewsTitle}>{td.reviewsTitle} ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className={styles.noReviews}>{td.noReviews}</p>
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

      {/* Delete modal */}
      {showDeleteModal && (
        <div className={styles.overlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{td.deleteTitle}</h3>
            <p className={styles.modalText}>{td.deleteText}</p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowDeleteModal(false)}>{td.deleteNo}</button>
              <button className={styles.modalConfirm} onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? "..." : td.deleteYes}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
