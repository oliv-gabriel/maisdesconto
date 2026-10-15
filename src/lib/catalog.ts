import type { Store } from "./types";

export const storeMeta: Record<Store, { name: string; accent: string; initial: string }> = {
  amazon: { name: "Amazon", accent: "#ffad32", initial: "a" },
  mercadolivre: { name: "Mercado Livre", accent: "#ffe600", initial: "M" },
  shopee: { name: "Shopee", accent: "#ff5b2e", initial: "S" },
};

export function detectStore(url: string): Store | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("amazon.")) return "amazon";
    if (hostname.includes("mercadolivre.") || hostname.includes("mercadolibre.")) {
      return "mercadolivre";
    }
    if (hostname.includes("shopee.")) return "shopee";
  } catch {
    return null;
  }
  return null;
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
