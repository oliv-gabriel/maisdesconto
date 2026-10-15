export type Store = "amazon" | "mercadolivre" | "shopee";

export type PricePoint = {
  price: number;
  recordedAt: string;
};

export type Product = {
  id: string;
  name: string;
  store: Store;
  url: string;
  currentPrice: number;
  previousPrice: number | null;
  lowestPrice: number;
  targetPrice: number | null;
  createdAt: string;
  updatedAt: string;
  history: PricePoint[];
};

export type ProductInput = {
  name: string;
  url: string;
  currentPrice: number;
  targetPrice?: number | null;
};
