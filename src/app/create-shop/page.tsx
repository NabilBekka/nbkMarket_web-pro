"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import styles from "./page.module.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;

interface CategoryResult { id: number; name: string; parentName: string; display: string; }

export default function CreateShop() {
  const { lang, t } = useLang();
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [showAuth, setShowAuth] = useState(false);

  // Form state
  const [form, setForm] = useState({ firstName: "", lastName: "", companyName: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Company name check
  const [companyAvail, setCompanyAvail] = useState<boolean | null>(null);
  const [checkingCompany, setCheckingCompany] = useState(false);
  const companyTimer = useRef<NodeJS.Timeout | null>(null);

  // Category autocomplete
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([]);
  const [categoryHasMore, setCategoryHasMore] = useState(false);
  const [categoryOffset, setCategoryOffset] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResult | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const categoryTimer = useRef<NodeJS.Timeout | null>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Verify state
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const touch = (k: string) => setTouched((p) => ({ ...p, [k]: true }));

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced company name check
  useEffect(() => {
    if (form.companyName.length < 2) { setCompanyAvail(null); return; }
    setCheckingCompany(true);
    if (companyTimer.current) clearTimeout(companyTimer.current);
    companyTimer.current = setTimeout(async () => {
      const res = await api.auth.checkCompany(form.companyName);
      if (res.data) setCompanyAvail(res.data.available);
      setCheckingCompany(false);
    }, 500);
  }, [form.companyName]);

  // Debounced category search
  useEffect(() => {
    if (categoryQuery.length < 1) { setCategoryResults([]); setCategoryHasMore(false); setShowCategoryDropdown(false); return; }
    setCategoryLoading(true);
    if (categoryTimer.current) clearTimeout(categoryTimer.current);
    categoryTimer.current = setTimeout(async () => {
      const res = await api.categories.search(categoryQuery, lang, 0);
      if (res.data) {
        setCategoryResults(res.data.categories);
        setCategoryHasMore(res.data.hasMore);
        setCategoryOffset(0);
        setShowCategoryDropdown(true);
      }
      setCategoryLoading(false);
    }, 300);
  }, [categoryQuery, lang]);

  const handleCategoryMore = async () => {
    const newOffset = categoryOffset + 5;
    setCategoryLoading(true);
    const res = await api.categories.search(categoryQuery, lang, newOffset);
    if (res.data) {
      setCategoryResults(res.data.categories);
      setCategoryHasMore(res.data.hasMore);
      setCategoryOffset(newOffset);
    }
    setCategoryLoading(false);
  };

  const handleSelectCategory = (cat: CategoryResult) => {
    setSelectedCategory(cat);
    setCategoryQuery(cat.display);
    setShowCategoryDropdown(false);
  };

  const handleCategoryInputChange = (v: string) => {
    setCategoryQuery(v);
    if (selectedCategory) setSelectedCategory(null);
  };

  const fnValid = form.firstName.length === 0 || nameRegex.test(form.firstName);
  const lnValid = form.lastName.length === 0 || nameRegex.test(form.lastName);
  const emailValid = emailRegex.test(form.email);
  const checks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  };
  const allChecks = Object.values(checks).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPw(true);
    setTouched({ firstName: true, lastName: true, email: true, companyName: true, category: true });
    setServerError("");

    if (!nameRegex.test(form.firstName) || !nameRegex.test(form.lastName) ||
        !emailValid || !allChecks || form.companyName.length < 2 || companyAvail === false || !selectedCategory) return;

    setLoading(true);
    const res = await api.auth.register({
      email: form.email, password: form.password,
      first_name: form.firstName, last_name: form.lastName,
      company_name: form.companyName, category_id: selectedCategory.id, lang,
    });
    setLoading(false);

    if (res.error) {
      if (res.error.includes("Email")) setServerError(t.createShop.emailTaken);
      else if (res.error.includes("ompany")) setServerError(t.createShop.companyError);
      else setServerError(res.error);
      return;
    }

    setStep("verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setVerifyError("");
    setVerifyLoading(true);
    const res = await api.auth.verifyEmail({ email: form.email, code });
    setVerifyLoading(false);
    if (res.error) { setVerifyError(t.createShop.verifyError); return; }
    if (res.data) {
      login(res.data.accessToken, res.data.user as Parameters<typeof login>[1]);
      setVerifySuccess(true);
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <main>
      <Header />
      <div className={styles.container}>
        <a href="/" className={styles.back}>{t.createShop.back}</a>

        {step === "form" && (
          <form onSubmit={handleRegister} noValidate>
            <h1 className={styles.title}>{t.createShop.title}</h1>
            <p className={styles.subtitle}>{t.createShop.subtitle}</p>

            {serverError && <p className={styles.errorBox}>{serverError}</p>}

            {/* First name / Last name */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{t.createShop.firstName}</label>
                <input type="text" className={`${styles.input} ${touched.firstName && form.firstName.length > 0 && !fnValid ? styles.inputError : ""}`} placeholder={t.createShop.firstNamePlaceholder} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} onBlur={() => touch("firstName")} required />
                {touched.firstName && form.firstName.length > 0 && !fnValid && <p className={styles.errorText}>{t.createShop.nameError}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.createShop.lastName}</label>
                <input type="text" className={`${styles.input} ${touched.lastName && form.lastName.length > 0 && !lnValid ? styles.inputError : ""}`} placeholder={t.createShop.lastNamePlaceholder} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} onBlur={() => touch("lastName")} required />
                {touched.lastName && form.lastName.length > 0 && !lnValid && <p className={styles.errorText}>{t.createShop.nameError}</p>}
              </div>
            </div>

            {/* Company name */}
            <div className={styles.field}>
              <label className={styles.label}>{t.createShop.companyName}</label>
              <input type="text" className={`${styles.input} ${form.companyName.length >= 2 && companyAvail === false ? styles.inputError : ""} ${form.companyName.length >= 2 && companyAvail === true ? styles.inputOk : ""}`} placeholder={t.createShop.companyNamePlaceholder} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} required />
              {checkingCompany && <p className={styles.checkText}>...</p>}
              {!checkingCompany && form.companyName.length >= 2 && companyAvail === false && <p className={styles.errorText}>{t.createShop.companyError}</p>}
              {!checkingCompany && form.companyName.length >= 2 && companyAvail === true && <p className={styles.okText}>✓</p>}
            </div>

            {/* Category autocomplete */}
            <div className={styles.field} ref={categoryRef}>
              <label className={styles.label}>{t.createShop.category}</label>
              <input
                type="text"
                className={`${styles.input} ${touched.category && !selectedCategory ? styles.inputError : ""} ${selectedCategory ? styles.inputOk : ""}`}
                placeholder={t.createShop.categoryPlaceholder}
                value={categoryQuery}
                onChange={(e) => handleCategoryInputChange(e.target.value)}
                onFocus={() => { if (categoryResults.length > 0 && !selectedCategory) setShowCategoryDropdown(true); }}
                onBlur={() => touch("category")}
              />
              {touched.category && !selectedCategory && <p className={styles.errorText}>{t.createShop.categoryRequired}</p>}
              {selectedCategory && <p className={styles.okText}>✓ {selectedCategory.display}</p>}

              {showCategoryDropdown && (
                <div className={styles.dropdown}>
                  {categoryLoading && <div className={styles.dropdownItem} style={{ color: "#999" }}>...</div>}
                  {!categoryLoading && categoryResults.length === 0 && categoryQuery.length > 0 && (
                    <div className={styles.dropdownItem} style={{ color: "#999" }}>—</div>
                  )}
                  {categoryResults.map((cat) => (
                    <button key={cat.id} type="button" className={styles.dropdownItem} onClick={() => handleSelectCategory(cat)}>
                      <span className={styles.dropdownName}>{cat.name}</span>
                      <span className={styles.dropdownParent}>{cat.parentName}</span>
                    </button>
                  ))}
                  {categoryHasMore && (
                    <button type="button" className={styles.dropdownMore} onClick={handleCategoryMore}>
                      {t.createShop.categoryMore} →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label}>{t.createShop.email}</label>
              <input type="email" className={`${styles.input} ${touched.email && form.email.length > 0 && !emailValid ? styles.inputError : ""}`} placeholder={t.createShop.emailPlaceholder} value={form.email} onChange={(e) => update("email", e.target.value)} onBlur={() => touch("email")} required />
              {touched.email && form.email.length > 0 && !emailValid && <p className={styles.errorText}>{t.createShop.emailError}</p>}
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label}>{t.createShop.password}</label>
              <div className={styles.passwordWrap}>
                <input type={showPw ? "text" : "password"} className={styles.input} placeholder={t.createShop.passwordPlaceholder} value={form.password} onChange={(e) => { update("password", e.target.value); setTouchedPw(true); }} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>{showPw ? "🙈" : "👁️"}</button>
              </div>
              {touchedPw && form.password.length > 0 && (
                <div className={styles.checks}>
                  {Object.entries(checks).map(([k, v]) => (
                    <span key={k} className={v ? styles.checkOk : styles.checkFail}>
                      {v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "..." : t.createShop.submit}
            </button>

            <p className={styles.bottomText}>
              {t.createShop.hasAccount}{" "}
              <a href="#" className={styles.linkBtn} onClick={(e) => { e.preventDefault(); setShowAuth(true); }}>{t.createShop.login}</a>
            </p>
          </form>
        )}

        {step === "verify" && (
          <div>
            <h1 className={styles.title}>{t.createShop.verifyTitle}</h1>
            <p className={styles.subtitle}>{t.createShop.verifySubtitle} <strong>{form.email}</strong></p>
            {verifySuccess ? (
              <div className={styles.successBox}><p className={styles.successText}>✓ {t.createShop.verifySuccess}</p></div>
            ) : (
              <form onSubmit={handleVerify} noValidate>
                {verifyError && <p className={styles.errorBox}>{verifyError}</p>}
                <input type="text" className={styles.codeInput} placeholder={t.createShop.verifyPlaceholder} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" />
                <button type="submit" className={styles.submitBtn} disabled={verifyLoading || code.length !== 6}>{verifyLoading ? "..." : t.createShop.verifySubmit}</button>
                <button type="button" className={styles.resendBtn} onClick={() => api.auth.resendCode({ email: form.email })}>{t.createShop.verifyResend}</button>
              </form>
            )}
          </div>
        )}
      </div>
      <Footer />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
}
