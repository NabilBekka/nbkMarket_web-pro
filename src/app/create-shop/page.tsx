"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import styles from "./page.module.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;

export default function CreateShop() {
  const { lang, t } = useLang();
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");

  // Form state
  const [form, setForm] = useState({
    firstName: "", lastName: "", companyName: "", email: "", password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Company name check
  const [companyAvail, setCompanyAvail] = useState<boolean | null>(null);
  const [checkingCompany, setCheckingCompany] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Verify state
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const touch = (k: string) => setTouched((p) => ({ ...p, [k]: true }));

  // Debounced company name check
  useEffect(() => {
    if (form.companyName.length < 2) { setCompanyAvail(null); return; }
    setCheckingCompany(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await api.auth.checkCompany(form.companyName);
      if (res.data) setCompanyAvail(res.data.available);
      setCheckingCompany(false);
    }, 500);
  }, [form.companyName]);

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
    setTouched({ firstName: true, lastName: true, email: true, companyName: true });
    setServerError("");

    if (!nameRegex.test(form.firstName) || !nameRegex.test(form.lastName) ||
        !emailValid || !allChecks || form.companyName.length < 2 || companyAvail === false) return;

    setLoading(true);
    const res = await api.auth.register({
      email: form.email, password: form.password,
      first_name: form.firstName, last_name: form.lastName,
      company_name: form.companyName, lang,
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

    if (res.error) {
      setVerifyError(t.createShop.verifyError);
      return;
    }

    if (res.data) {
      login(res.data.accessToken, res.data.user as Parameters<typeof login>[1]);
      setVerifySuccess(true);
      setTimeout(() => router.push("/"), 2000);
    }
  };

  const handleResend = async () => {
    await api.auth.resendCode({ email: form.email });
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

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>{t.createShop.firstName}</label>
                <input
                  type="text"
                  className={`${styles.input} ${touched.firstName && form.firstName.length > 0 && !fnValid ? styles.inputError : ""}`}
                  placeholder={t.createShop.firstNamePlaceholder}
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  onBlur={() => touch("firstName")}
                  required
                />
                {touched.firstName && form.firstName.length > 0 && !fnValid && (
                  <p className={styles.errorText}>{t.createShop.nameError}</p>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.createShop.lastName}</label>
                <input
                  type="text"
                  className={`${styles.input} ${touched.lastName && form.lastName.length > 0 && !lnValid ? styles.inputError : ""}`}
                  placeholder={t.createShop.lastNamePlaceholder}
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  onBlur={() => touch("lastName")}
                  required
                />
                {touched.lastName && form.lastName.length > 0 && !lnValid && (
                  <p className={styles.errorText}>{t.createShop.nameError}</p>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.createShop.companyName}</label>
              <input
                type="text"
                className={`${styles.input} ${form.companyName.length >= 2 && companyAvail === false ? styles.inputError : ""} ${form.companyName.length >= 2 && companyAvail === true ? styles.inputOk : ""}`}
                placeholder={t.createShop.companyNamePlaceholder}
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                required
              />
              {checkingCompany && <p className={styles.checkText}>...</p>}
              {!checkingCompany && form.companyName.length >= 2 && companyAvail === false && (
                <p className={styles.errorText}>{t.createShop.companyError}</p>
              )}
              {!checkingCompany && form.companyName.length >= 2 && companyAvail === true && (
                <p className={styles.okText}>✓</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.createShop.email}</label>
              <input
                type="email"
                className={`${styles.input} ${touched.email && form.email.length > 0 && !emailValid ? styles.inputError : ""}`}
                placeholder={t.createShop.emailPlaceholder}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => touch("email")}
                required
              />
              {touched.email && form.email.length > 0 && !emailValid && (
                <p className={styles.errorText}>{t.createShop.emailError}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.createShop.password}</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showPw ? "text" : "password"}
                  className={styles.input}
                  placeholder={t.createShop.passwordPlaceholder}
                  value={form.password}
                  onChange={(e) => { update("password", e.target.value); setTouchedPw(true); }}
                  required
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                  {showPw ? "🙈" : "👁️"}
                </button>
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
              <a href="#" className={styles.linkBtn} onClick={(e) => { e.preventDefault(); }}>{t.createShop.login}</a>
            </p>
          </form>
        )}

        {step === "verify" && (
          <div>
            <h1 className={styles.title}>{t.createShop.verifyTitle}</h1>
            <p className={styles.subtitle}>
              {t.createShop.verifySubtitle} <strong>{form.email}</strong>
            </p>

            {verifySuccess ? (
              <div className={styles.successBox}>
                <p className={styles.successText}>✓ {t.createShop.verifySuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleVerify} noValidate>
                {verifyError && <p className={styles.errorBox}>{verifyError}</p>}

                <input
                  type="text"
                  className={styles.codeInput}
                  placeholder={t.createShop.verifyPlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                />

                <button type="submit" className={styles.submitBtn} disabled={verifyLoading || code.length !== 6}>
                  {verifyLoading ? "..." : t.createShop.verifySubmit}
                </button>

                <button type="button" className={styles.resendBtn} onClick={handleResend}>
                  {t.createShop.verifyResend}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
