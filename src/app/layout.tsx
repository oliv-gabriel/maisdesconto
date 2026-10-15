import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "maisdesconto | Monitor de preços",
  description: "Acompanhe preços na Amazon, Mercado Livre e Shopee.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
