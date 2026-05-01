"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/Dashboard.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
