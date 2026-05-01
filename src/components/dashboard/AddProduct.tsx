"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./AddProduct.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/merchant").replace(/\/merchant$/, "").replace(/\/api$/, "");

export default function AddProduct() {
  const router = useRouter();
  const { t } = useLang();
  const { accessToken } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const mainRef = useRef<HTMLInputElement>(null);
  const img2Ref = useRef<HTMLInputElement>(null);
  const img3Ref = useRef<HTMLInputElement>(null);

  const touch = (k: string) => setTouched(p => ({ ...p, [k]: true }));

  const addKeyword = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && keywordInput.trim()) {
      e.preventDefault();
      submitKeyword();
    }
  };
  const submitKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) setKeywords(prev => [...prev, kw]);
    setKeywordInput("");
  };
  const removeKeyword = (kw: string) => setKeywords(prev => prev.filter(k => k !== kw));

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

    setLoading(true);
    const res = await api.products.create(accessToken, {
      title: title.trim(),
      description: description.trim(),
      keywords: keywords.join(", "),
      price: priceNum,
      main_image: mainImage,
      image_2: image2 || undefined,
      image_3: image3 || undefined,
    });
    setLoading(false);

    if (res.error) { setServerError(res.error); return; }
    setSuccess(true);
    setTimeout(() => router.push("/products"), 1500);
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
          <div className={styles.imagePlaceholder}>
            <span className={styles.uploadingText}>...</span>
          </div>
        ) : hasImage ? (
          <img src={imagePath} alt={label} className={styles.imagePreview} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <svg className={styles.photoIcon} viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        <button type="button" className={styles.addPhotoBtn} onClick={() => inputRef.current?.click()}>
          <span className={styles.addPhotoBtnPlus}>+</span>
        </button>

        <span className={styles.imageLabel}>{label}</span>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.push("/products")}>{t.addProductForm.back}</button>
      <h1 className={styles.title}>{t.addProductForm.title}</h1>

      {success ? (
        <div className={styles.successBox}>✓ {t.addProductForm.success}</div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {serverError && <p className={styles.errorBox}>{serverError}</p>}

          {/* Image upload boxes */}
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

          <div className={styles.field}>
            <label className={styles.label}>{t.addProductForm.keywords}</label>
            <p className={styles.hintText}>{t.addProductForm.keywordsHint}</p>
            {keywords.length > 0 && (
              <div className={styles.keywordChips}>
                {keywords.map(kw => (
                  <span key={kw} className={styles.keywordChip}>{kw} <button type="button" className={styles.keywordRemove} onClick={() => removeKeyword(kw)}>✕</button></span>
                ))}
              </div>
            )}
            <div className={styles.keywordInputRow}>
              <input type="text" className={styles.input} placeholder={t.addProductForm.keywordsPlaceholder} value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={addKeyword} />
              <button type="button" className={styles.keywordAddBtn} onClick={submitKeyword}>{t.addProductForm.keywordsAdd}</button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || !allValid}>
            {loading ? "..." : t.addProductForm.submit}
          </button>
        </form>
      )}
    </div>
  );
}
