"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./AddProduct.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/merchant").replace(/\/merchant$/, "").replace(/\/api$/, "");

interface Product {
  id: string; title: string; description: string; price: number;
  main_image: string; image_2: string | null; image_3: string | null;
}

export default function EditProduct({ productId, onBack, onSuccess }: { productId: string; onBack: () => void; onSuccess: () => void }) {
  const { t } = useLang();
  const { accessToken } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const mainRef = useRef<HTMLInputElement>(null);
  const img2Ref = useRef<HTMLInputElement>(null);
  const img3Ref = useRef<HTMLInputElement>(null);

  const touch = (k: string) => setTouched(p => ({ ...p, [k]: true }));

  // Load existing product
  useEffect(() => {
    (async () => {
      const res = await api.products.getById(productId);
      if (res.data?.product) {
        const p = res.data.product as unknown as Product;
        setTitle(p.title);
        setPrice(p.price.toString());
        setDescription(p.description);
        setMainImage(p.main_image);
        setImage2(p.image_2 || "");
        setImage3(p.image_3 || "");
      }
      setLoading(false);
    })();
  }, [productId]);

  const handleUpload = async (file: File, key: "main" | "img2" | "img3") => {
    if (!accessToken) return;
    setUploading(p => ({ ...p, [key]: true }));
    const res = await api.upload.image(accessToken, file);
    setUploading(p => ({ ...p, [key]: false }));
    if (res.error) { setServerError(res.error); return; }
    if (res.data?.path) {
      const fullUrl = `${API_BASE}${res.data.path}`;
      if (key === "main") setMainImage(fullUrl);
      else if (key === "img2") setImage2(fullUrl);
      else setImage3(fullUrl);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: "main" | "img2" | "img3") => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, key);
    e.target.value = "";
  };

  const titleValid = title.trim().length > 0;
  const priceNum = parseFloat(price);
  const priceValid = !isNaN(priceNum) && priceNum > 0;
  const mainImageValid = mainImage.length > 0;
  const descriptionValid = description.trim().length > 0;
  const allValid = titleValid && priceValid && mainImageValid && descriptionValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, price: true, mainImage: true, description: true });
    setServerError("");
    if (!allValid || !accessToken) return;

    setSaving(true);
    const res = await api.products.update(accessToken, productId, {
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      main_image: mainImage,
      image_2: image2 || null,
      image_3: image3 || null,
    });
    setSaving(false);

    if (res.error) { setServerError(res.error); return; }
    setSuccess(true);
    setTimeout(onSuccess, 1500);
  };

  const renderImageBox = (
    imagePath: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
    key: "main" | "img2" | "img3",
    label: string,
    required: boolean,
  ) => {
    const isUploading = uploading[key];
    const hasImage = imagePath.length > 0;
    const showError = required && touched.mainImage && !hasImage && key === "main";
    return (
      <div className={`${styles.imageBox} ${showError ? styles.imageBoxError : ""}`}>
        <input type="file" accept="image/jpeg,image/png" ref={inputRef} className={styles.fileInput} onChange={(e) => onFileChange(e, key)} />
        {isUploading ? (
          <div className={styles.imagePlaceholder}><span className={styles.uploadingText}>...</span></div>
        ) : hasImage ? (
          <img src={imagePath} alt={label} className={styles.imagePreview} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg className={styles.photoIcon} viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
          </div>
        )}
        <button type="button" className={styles.addPhotoBtn} onClick={() => inputRef.current?.click()}><span className={styles.addPhotoBtnPlus}>+</span></button>
        <span className={styles.imageLabel}>{label}</span>
      </div>
    );
  };

  if (loading) return <div className={styles.container}><p style={{ textAlign: "center", padding: 60, color: "#ccc" }}>...</p></div>;

  const te = t.editProductForm;

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={onBack}>{te.back}</button>
      <h1 className={styles.title}>{te.title}</h1>

      {success ? (
        <div className={styles.successBox}>✓ {te.success}</div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {serverError && <p className={styles.errorBox}>{serverError}</p>}

          <div className={styles.imagesRow}>
            {renderImageBox(mainImage, mainRef, "main", t.addProductForm.mainImage, true)}
            {renderImageBox(image2, img2Ref, "img2", t.addProductForm.image2, false)}
            {renderImageBox(image3, img3Ref, "img3", t.addProductForm.image3, false)}
          </div>
          {touched.mainImage && !mainImageValid && <p className={styles.errorText}>{t.addProductForm.required}</p>}

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.productTitle} *</label>
            <input type="text" className={`${styles.input} ${touched.title && !titleValid ? styles.inputError : ""}`} placeholder={t.addProductForm.productTitlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => touch("title")} />
            {touched.title && !titleValid && <p className={styles.errorText}>{t.addProductForm.required}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.price} *</label>
            <input type="number" className={`${styles.input} ${touched.price && !priceValid ? styles.inputError : ""}`} placeholder={t.addProductForm.pricePlaceholder} value={price} onChange={(e) => setPrice(e.target.value)} onBlur={() => touch("price")} min="0" step="any" />
            {touched.price && !priceValid && <p className={styles.errorText}>{t.addProductForm.invalidPrice}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.description} *</label>
            <textarea className={`${styles.textarea} ${touched.description && !descriptionValid ? styles.inputError : ""}`} placeholder={t.addProductForm.descriptionPlaceholder} value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => touch("description")} rows={5} />
            {touched.description && !descriptionValid && <p className={styles.errorText}>{t.addProductForm.required}</p>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={saving || !allValid}>
            {saving ? "..." : te.submit}
          </button>
        </form>
      )}
    </div>
  );
}
