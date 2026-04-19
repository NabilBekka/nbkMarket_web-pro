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
interface Wilaya { code: number; name_fr: string; name_en: string; }

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

  // Company check
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

  // Wilayas
  const [allWilayas, setAllWilayas] = useState<Wilaya[]>([]);
  const [wilayaQuery, setWilayaQuery] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);
  const wilayaRef = useRef<HTMLDivElement>(null);

  // Activity type
  const [sellsBuys, setSellsBuys] = useState(false);
  const [offersServices, setOffersServices] = useState(false);
  const [hasPhysicalShop, setHasPhysicalShop] = useState(false);
  const [offersDelivery, setOffersDelivery] = useState(false);
  const [delivery69, setDelivery69] = useState(false);
  const [deliveryWilayas, setDeliveryWilayas] = useState<Wilaya[]>([]);
  const [showAddWilayaSearch, setShowAddWilayaSearch] = useState(false);
  const [addWilayaQuery, setAddWilayaQuery] = useState("");
  const addWilayaRef = useRef<HTMLDivElement>(null);

  // Verify state
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const touch = (k: string) => setTouched((p) => ({ ...p, [k]: true }));
  const wName = (w: Wilaya) => lang === "fr" ? w.name_fr : w.name_en;

  // Load wilayas
  useEffect(() => {
    (async () => {
      const res = await api.wilayas.getAll();
      if (res.data?.wilayas) setAllWilayas(res.data.wilayas);
    })();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
      if (wilayaRef.current && !wilayaRef.current.contains(e.target as Node)) setShowWilayaDropdown(false);
      if (addWilayaRef.current && !addWilayaRef.current.contains(e.target as Node)) setShowAddWilayaSearch(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Company check debounce
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

  // Category search debounce
  useEffect(() => {
    if (categoryQuery.length < 1) { setCategoryResults([]); setCategoryHasMore(false); setShowCategoryDropdown(false); return; }
    setCategoryLoading(true);
    if (categoryTimer.current) clearTimeout(categoryTimer.current);
    categoryTimer.current = setTimeout(async () => {
      const res = await api.categories.search(categoryQuery, lang, 0);
      if (res.data) { setCategoryResults(res.data.categories); setCategoryHasMore(res.data.hasMore); setCategoryOffset(0); setShowCategoryDropdown(true); }
      setCategoryLoading(false);
    }, 300);
  }, [categoryQuery, lang]);

  const handleCategoryMore = async () => {
    const newOffset = categoryOffset + 5;
    setCategoryLoading(true);
    const res = await api.categories.search(categoryQuery, lang, newOffset);
    if (res.data) { setCategoryResults(res.data.categories); setCategoryHasMore(res.data.hasMore); setCategoryOffset(newOffset); }
    setCategoryLoading(false);
  };

  // Wilaya search filter
  const filteredWilayas = allWilayas.filter(w => {
    if (wilayaQuery.length < 1) return false;
    const q = wilayaQuery.toLowerCase();
    return w.name_fr.toLowerCase().includes(q) || w.name_en.toLowerCase().includes(q) || w.code.toString() === q;
  }).slice(0, 8);

  // Add delivery wilaya filter
  const filteredAddWilayas = allWilayas.filter(w => {
    if (addWilayaQuery.length < 1) return false;
    if (deliveryWilayas.some(dw => dw.code === w.code)) return false;
    const q = addWilayaQuery.toLowerCase();
    return w.name_fr.toLowerCase().includes(q) || w.name_en.toLowerCase().includes(q) || w.code.toString() === q;
  }).slice(0, 8);

  // When merchant wilaya changes, auto-add it to delivery wilayas
  useEffect(() => {
    if (selectedWilaya && offersDelivery && !delivery69) {
      setDeliveryWilayas(prev => {
        if (prev.some(w => w.code === selectedWilaya.code)) return prev;
        return [selectedWilaya, ...prev.filter(w => w.code !== selectedWilaya.code)];
      });
    }
  }, [selectedWilaya, offersDelivery, delivery69]);

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
  const activityValid = sellsBuys || offersServices;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPw(true);
    setTouched({ firstName: true, lastName: true, email: true, companyName: true, category: true, wilaya: true, activity: true });
    setServerError("");

    if (!nameRegex.test(form.firstName) || !nameRegex.test(form.lastName) ||
        !emailValid || !allChecks || form.companyName.length < 2 || companyAvail === false ||
        !selectedCategory || !selectedWilaya || !activityValid) return;

    // Build delivery wilayas list
    let dwCodes: number[] = [];
    if (offersDelivery) {
      if (delivery69) {
        dwCodes = allWilayas.map(w => w.code);
      } else {
        dwCodes = deliveryWilayas.map(w => w.code);
      }
    }

    setLoading(true);
    const res = await api.auth.register({
      email: form.email, password: form.password,
      first_name: form.firstName, last_name: form.lastName,
      company_name: form.companyName, category_id: selectedCategory.id,
      wilaya_code: selectedWilaya.code,
      sells_buys: sellsBuys, offers_services: offersServices,
      has_physical_shop: hasPhysicalShop, offers_delivery: offersDelivery,
      delivery_wilayas: dwCodes,
      lang,
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

  const tc = t.createShop;

  return (
    <main>
      <Header />
      <div className={styles.container}>
        <a href="/" className={styles.back}>{tc.back}</a>

        {step === "form" && (
          <form onSubmit={handleRegister} noValidate>
            <h1 className={styles.title}>{tc.title}</h1>
            <p className={styles.subtitle}>{tc.subtitle}</p>
            {serverError && <p className={styles.errorBox}>{serverError}</p>}

            {/* First name / Last name */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{tc.firstName}</label>
                <input type="text" className={`${styles.input} ${touched.firstName && form.firstName.length > 0 && !fnValid ? styles.inputError : ""}`} placeholder={tc.firstNamePlaceholder} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} onBlur={() => touch("firstName")} />
                {touched.firstName && form.firstName.length > 0 && !fnValid && <p className={styles.errorText}>{tc.nameError}</p>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{tc.lastName}</label>
                <input type="text" className={`${styles.input} ${touched.lastName && form.lastName.length > 0 && !lnValid ? styles.inputError : ""}`} placeholder={tc.lastNamePlaceholder} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} onBlur={() => touch("lastName")} />
                {touched.lastName && form.lastName.length > 0 && !lnValid && <p className={styles.errorText}>{tc.nameError}</p>}
              </div>
            </div>

            {/* Company name */}
            <div className={styles.field}>
              <label className={styles.label}>{tc.companyName}</label>
              <input type="text" className={`${styles.input} ${form.companyName.length >= 2 && companyAvail === false ? styles.inputError : ""} ${form.companyName.length >= 2 && companyAvail === true ? styles.inputOk : ""}`} placeholder={tc.companyNamePlaceholder} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
              {checkingCompany && <p className={styles.checkText}>...</p>}
              {!checkingCompany && form.companyName.length >= 2 && companyAvail === false && <p className={styles.errorText}>{tc.companyError}</p>}
              {!checkingCompany && form.companyName.length >= 2 && companyAvail === true && <p className={styles.okText}>✓</p>}
            </div>

            {/* Category autocomplete */}
            <div className={styles.field} ref={categoryRef}>
              <label className={styles.label}>{tc.category}</label>
              <input type="text" className={`${styles.input} ${touched.category && !selectedCategory ? styles.inputError : ""} ${selectedCategory ? styles.inputOk : ""}`} placeholder={tc.categoryPlaceholder} value={categoryQuery} onChange={(e) => { setCategoryQuery(e.target.value); if (selectedCategory) setSelectedCategory(null); }} onFocus={() => { if (categoryResults.length > 0 && !selectedCategory) setShowCategoryDropdown(true); }} onBlur={() => touch("category")} />
              {touched.category && !selectedCategory && <p className={styles.errorText}>{tc.categoryRequired}</p>}
              {selectedCategory && <p className={styles.okText}>✓ {selectedCategory.display}</p>}
              {showCategoryDropdown && (
                <div className={styles.dropdown}>
                  {categoryLoading && <div className={styles.dropdownItem} style={{ color: "#999" }}>...</div>}
                  {!categoryLoading && categoryResults.length === 0 && <div className={styles.dropdownItem} style={{ color: "#999" }}>—</div>}
                  {categoryResults.map((cat) => (
                    <button key={cat.id} type="button" className={styles.dropdownItem} onClick={() => { setSelectedCategory(cat); setCategoryQuery(cat.display); setShowCategoryDropdown(false); }}>
                      <span className={styles.dropdownName}>{cat.name}</span>
                      <span className={styles.dropdownParent}>{cat.parentName}</span>
                    </button>
                  ))}
                  {categoryHasMore && <button type="button" className={styles.dropdownMore} onClick={handleCategoryMore}>{tc.categoryMore} →</button>}
                </div>
              )}
            </div>

            {/* Wilaya autocomplete */}
            <div className={styles.field} ref={wilayaRef}>
              <label className={styles.label}>{tc.wilaya}</label>
              <input type="text" className={`${styles.input} ${touched.wilaya && !selectedWilaya ? styles.inputError : ""} ${selectedWilaya ? styles.inputOk : ""}`} placeholder={tc.wilayaPlaceholder} value={wilayaQuery} onChange={(e) => { setWilayaQuery(e.target.value); if (selectedWilaya) { setSelectedWilaya(null); setDeliveryWilayas([]); } setShowWilayaDropdown(true); }} onFocus={() => { if (wilayaQuery.length > 0) setShowWilayaDropdown(true); }} onBlur={() => touch("wilaya")} />
              {touched.wilaya && !selectedWilaya && <p className={styles.errorText}>{tc.wilayaRequired}</p>}
              {selectedWilaya && <p className={styles.okText}>✓ {selectedWilaya.code} - {wName(selectedWilaya)}</p>}
              {showWilayaDropdown && filteredWilayas.length > 0 && (
                <div className={styles.dropdown}>
                  {filteredWilayas.map(w => (
                    <button key={w.code} type="button" className={styles.dropdownItem} onClick={() => { setSelectedWilaya(w); setWilayaQuery(`${w.code} - ${wName(w)}`); setShowWilayaDropdown(false); }}>
                      <span className={styles.dropdownName}>{w.code} - {wName(w)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activity type */}
            <div className={styles.field}>
              <label className={styles.label}>{tc.activityType}</label>
              <div className={styles.checkboxRow}>
                <label className={styles.checkbox}><input type="checkbox" checked={sellsBuys} onChange={(e) => { setSellsBuys(e.target.checked); if (!e.target.checked) { setHasPhysicalShop(false); setOffersDelivery(false); setDelivery69(false); setDeliveryWilayas([]); } }} /> {tc.sellsBuys}</label>
                <label className={styles.checkbox}><input type="checkbox" checked={offersServices} onChange={(e) => setOffersServices(e.target.checked)} /> {tc.offersServices}</label>
              </div>
              {touched.activity && !activityValid && <p className={styles.errorText}>{tc.activityRequired}</p>}
            </div>

            {/* If sells_buys: physical shop + delivery */}
            {sellsBuys && (
              <div className={styles.field}>
                <div className={styles.checkboxRow}>
                  <label className={styles.checkbox}><input type="checkbox" checked={hasPhysicalShop} onChange={(e) => setHasPhysicalShop(e.target.checked)} /> {tc.hasPhysicalShop}</label>
                  <label className={styles.checkbox}><input type="checkbox" checked={offersDelivery} onChange={(e) => { setOffersDelivery(e.target.checked); if (!e.target.checked) { setDelivery69(false); setDeliveryWilayas([]); } }} /> {tc.offersDelivery}</label>
                </div>
              </div>
            )}

            {/* If delivery: 69 wilayas toggle */}
            {sellsBuys && offersDelivery && (
              <div className={styles.field}>
                <label className={styles.label}>{tc.delivery69}</label>
                <div className={styles.toggleRow}>
                  <button type="button" className={`${styles.toggleBtn} ${delivery69 ? styles.toggleActive : ""}`} onClick={() => { setDelivery69(true); setDeliveryWilayas([]); }}>{tc.delivery69Yes}</button>
                  <button type="button" className={`${styles.toggleBtn} ${!delivery69 ? styles.toggleActive : ""}`} onClick={() => setDelivery69(false)}>{tc.delivery69No}</button>
                </div>
              </div>
            )}

            {/* If delivery + not 69: delivery wilayas list */}
            {sellsBuys && offersDelivery && !delivery69 && (
              <div className={styles.field}>
                <label className={styles.label}>{tc.deliveryWilayasTitle}</label>

                {/* Selected delivery wilayas */}
                <div className={styles.deliveryList}>
                  {deliveryWilayas.map(w => (
                    <div key={w.code} className={styles.deliveryChip}>
                      <span>{w.code} - {wName(w)}</span>
                      {selectedWilaya && w.code === selectedWilaya.code
                        ? <span className={styles.chipLock}>📍</span>
                        : <button type="button" className={styles.chipRemove} onClick={() => setDeliveryWilayas(prev => prev.filter(dw => dw.code !== w.code))}>✕</button>
                      }
                    </div>
                  ))}
                </div>

                {/* Add wilaya button/search */}
                {deliveryWilayas.length < 10 && (
                  <div ref={addWilayaRef} style={{ position: "relative" }}>
                    {showAddWilayaSearch ? (
                      <>
                        <input type="text" className={styles.input} placeholder={tc.wilayaPlaceholder} value={addWilayaQuery} onChange={(e) => setAddWilayaQuery(e.target.value)} autoFocus />
                        {filteredAddWilayas.length > 0 && (
                          <div className={styles.dropdown}>
                            {filteredAddWilayas.map(w => (
                              <button key={w.code} type="button" className={styles.dropdownItem} onClick={() => {
                                setDeliveryWilayas(prev => [...prev, w]);
                                setAddWilayaQuery("");
                                setShowAddWilayaSearch(false);
                              }}>
                                <span className={styles.dropdownName}>{w.code} - {wName(w)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <button type="button" className={styles.addWilayaBtn} onClick={() => setShowAddWilayaSearch(true)}>{tc.addWilaya}</button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label}>{tc.email}</label>
              <input type="email" className={`${styles.input} ${touched.email && form.email.length > 0 && !emailValid ? styles.inputError : ""}`} placeholder={tc.emailPlaceholder} value={form.email} onChange={(e) => update("email", e.target.value)} onBlur={() => touch("email")} />
              {touched.email && form.email.length > 0 && !emailValid && <p className={styles.errorText}>{tc.emailError}</p>}
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label}>{tc.password}</label>
              <div className={styles.passwordWrap}>
                <input type={showPw ? "text" : "password"} className={styles.input} placeholder={tc.passwordPlaceholder} value={form.password} onChange={(e) => { update("password", e.target.value); setTouchedPw(true); }} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>{showPw ? "🙈" : "👁️"}</button>
              </div>
              {touchedPw && form.password.length > 0 && (
                <div className={styles.checks}>
                  {Object.entries(checks).map(([k, v]) => (
                    <span key={k} className={v ? styles.checkOk : styles.checkFail}>{v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}</span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? "..." : tc.submit}</button>
            <p className={styles.bottomText}>{tc.hasAccount}{" "}<a href="#" className={styles.linkBtn} onClick={(e) => { e.preventDefault(); setShowAuth(true); }}>{tc.login}</a></p>
          </form>
        )}

        {step === "verify" && (
          <div>
            <h1 className={styles.title}>{tc.verifyTitle}</h1>
            <p className={styles.subtitle}>{tc.verifySubtitle} <strong>{form.email}</strong></p>
            {verifySuccess ? (
              <div className={styles.successBox}><p className={styles.successText}>✓ {tc.verifySuccess}</p></div>
            ) : (
              <form onSubmit={handleVerify} noValidate>
                {verifyError && <p className={styles.errorBox}>{verifyError}</p>}
                <input type="text" className={styles.codeInput} placeholder={tc.verifyPlaceholder} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" />
                <button type="submit" className={styles.submitBtn} disabled={verifyLoading || code.length !== 6}>{verifyLoading ? "..." : tc.verifySubmit}</button>
                <button type="button" className={styles.resendBtn} onClick={() => api.auth.resendCode({ email: form.email })}>{tc.verifyResend}</button>
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
