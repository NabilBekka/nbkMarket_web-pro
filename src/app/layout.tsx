import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "NBK Market Pro",
  description: "Espace commerçant - Gérez votre boutique en ligne",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
