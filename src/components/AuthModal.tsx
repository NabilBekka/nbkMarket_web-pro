"use client";

import { useState } from "react";
import styles from "./AuthModal.module.css";
import LoginForm from "./LoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

type View = "login" | "forgot";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("login");

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {view === "login" && (
          <LoginForm
            onSwitchForgot={() => setView("forgot")}
            onSuccess={onClose}
          />
        )}

        {view === "forgot" && (
          <ForgotPasswordForm onSwitchLogin={() => setView("login")} />
        )}
      </div>
    </div>
  );
}
