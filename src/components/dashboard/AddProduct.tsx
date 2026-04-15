"use client";
import { useState } from "react";
import styles from "./AddProduct.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function AddProduct({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const { t } = useLang();
  const { accessToken } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [description, setDescription] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const touch = (k: string) => setTouched(p => ({ ...p, [k]: true }));

  const titleValid = title.trim().length > 0;
  const priceNum = parseFloat(price);
  const priceValid = !isNaN(priceNum) && priceNum > 0;
  const mainImageValid = mainImage.trim().length > 0;
  const descriptionValid = description.trim().length > 0;
  const allValid = titleValid && priceValid && mainImageValid && descriptionValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, price: true, mainImage: true, description: true });
    setServerError("");

    if (!allValid || !accessToken) return;

    setLoading(true);
    const res = await api.products.create(accessToken, {
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      main_image: mainImage.trim(),
      image_2: image2.trim() || undefined,
      image_3: image3.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setServerError(res.error);
      return;
    }

    setSuccess(true);
    setTimeout(onSuccess, 1500);
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBack}>{t.addProductForm.back}</button>
      <h1 className={styles.title}>{t.addProductForm.title}</h1>

      {success ? (
        <div className={styles.successBox}>✓ {t.addProductForm.success}</div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {serverError && <p className={styles.errorBox}>{serverError}</p>}

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.productTitle} *</label>
            <input
              type="text"
              className={`${styles.input} ${touched.title && !titleValid ? styles.inputError : ""}`}
              placeholder={t.addProductForm.productTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => touch("title")}
            />
            {touched.title && !titleValid && <p className={styles.errorText}>{t.addProductForm.required}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.price} *</label>
            <input
              type="number"
              className={`${styles.input} ${touched.price && !priceValid ? styles.inputError : ""}`}
              placeholder={t.addProductForm.pricePlaceholder}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => touch("price")}
              min="0"
              step="any"
            />
            {touched.price && !priceValid && <p className={styles.errorText}>{t.addProductForm.invalidPrice}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.mainImage} *</label>
            <input
              type="url"
              className={`${styles.input} ${touched.mainImage && !mainImageValid ? styles.inputError : ""}`}
              placeholder={t.addProductForm.mainImagePlaceholder}
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              onBlur={() => touch("mainImage")}
            />
            {touched.mainImage && !mainImageValid && <p className={styles.errorText}>{t.addProductForm.required}</p>}
            {mainImage.trim() && <div className={styles.preview}><img src={mainImage} alt="preview" className={styles.previewImg} onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "block")} /></div>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>{t.addProductForm.image2}</label>
              <input type="url" className={styles.input} placeholder={t.addProductForm.image2Placeholder} value={image2} onChange={(e) => setImage2(e.target.value)} />
              {image2.trim() && <div className={styles.preview}><img src={image2} alt="preview 2" className={styles.previewImg} onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "block")} /></div>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.addProductForm.image3}</label>
              <input type="url" className={styles.input} placeholder={t.addProductForm.image3Placeholder} value={image3} onChange={(e) => setImage3(e.target.value)} />
              {image3.trim() && <div className={styles.preview}><img src={image3} alt="preview 3" className={styles.previewImg} onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "block")} /></div>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.description} *</label>
            <textarea
              className={`${styles.textarea} ${touched.description && !descriptionValid ? styles.inputError : ""}`}
              placeholder={t.addProductForm.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => touch("description")}
              rows={5}
            />
            {touched.description && !descriptionValid && <p className={styles.errorText}>{t.addProductForm.required}</p>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || !allValid}>
            {loading ? "..." : t.addProductForm.submit}
          </button>
        </form>
      )}
    </div>
  );
}
