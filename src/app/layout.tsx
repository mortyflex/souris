import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Souris",
    template: "%s | Souris",
  },
  description:
    "Souris aide les professionnels de la beauté à gérer leurs rendez-vous, leurs clients, leurs produits et leur activité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
