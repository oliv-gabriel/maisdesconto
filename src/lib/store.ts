import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { detectStore } from "./catalog";
import type { Product, ProductInput } from "./types";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "products.json");

const demoProducts: Product[] = [
  {
    id: "demo-amazon",
    name: "Kindle 16 GB (última geração)",
    store: "amazon",
    url: "https://www.amazon.com.br/",
    currentPrice: 449,
    previousPrice: 499,
    lowestPrice: 429,
    targetPrice: 430,
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-14T14:00:00.000Z",
    history: [
      { price: 529, recordedAt: "2026-08-01T12:00:00.000Z" },
      { price: 499, recordedAt: "2026-08-08T12:00:00.000Z" },
      { price: 449, recordedAt: "2026-08-14T14:00:00.000Z" },
    ],
  },
  {
    id: "demo-ml",
    name: "Fone Bluetooth QCY H3",
    store: "mercadolivre",
    url: "https://www.mercadolivre.com.br/",
    currentPrice: 189.9,
    previousPrice: 229.9,
    lowestPrice: 179.9,
    targetPrice: 200,
    createdAt: "2026-08-03T12:00:00.000Z",
    updatedAt: "2026-08-14T14:00:00.000Z",
    history: [
      { price: 249.9, recordedAt: "2026-08-03T12:00:00.000Z" },
      { price: 229.9, recordedAt: "2026-08-09T12:00:00.000Z" },
      { price: 189.9, recordedAt: "2026-08-14T14:00:00.000Z" },
    ],
  },
  {
    id: "demo-shopee",
    name: "Smartwatch AMOLED 1,43\"",
    store: "shopee",
    url: "https://shopee.com.br/",
    currentPrice: 209.9,
    previousPrice: 219.9,
    lowestPrice: 209.9,
    targetPrice: 210,
    createdAt: "2026-08-04T12:00:00.000Z",
    updatedAt: "2026-08-14T14:00:00.000Z",
    history: [
      { price: 279.9, recordedAt: "2026-08-04T12:00:00.000Z" },
      { price: 219.9, recordedAt: "2026-08-10T12:00:00.000Z" },
      { price: 209.9, recordedAt: "2026-08-14T14:00:00.000Z" },
    ],
  },
];

async function save(products: Product[]) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(products, null, 2), "utf8");
}

export async function listProducts(): Promise<Product[]> {
  try {
    const saved = await readFile(dataFile, "utf8");
    return JSON.parse(saved) as Product[];
  } catch {
    await save(demoProducts);
    return demoProducts;
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const store = detectStore(input.url);
  if (!store) throw new Error("Use uma URL da Amazon, Mercado Livre ou Shopee.");

  const now = new Date().toISOString();
  const product: Product = {
    id: randomUUID(),
    name: input.name.trim(),
    store,
    url: input.url.trim(),
    currentPrice: input.currentPrice,
    previousPrice: null,
    lowestPrice: input.currentPrice,
    targetPrice: input.targetPrice ?? null,
    createdAt: now,
    updatedAt: now,
    history: [{ price: input.currentPrice, recordedAt: now }],
  };
  const products = await listProducts();
  products.unshift(product);
  await save(products);
  return product;
}

export async function registerPrice(id: string, price: number): Promise<Product | null> {
  const products = await listProducts();
  const product = products.find((item) => item.id === id);
  if (!product) return null;

  const now = new Date().toISOString();
  product.previousPrice = product.currentPrice;
  product.currentPrice = price;
  product.lowestPrice = Math.min(product.lowestPrice, price);
  product.updatedAt = now;
  product.history = [...product.history, { price, recordedAt: now }].slice(-90);
  await save(products);
  return product;
}

export async function removeProduct(id: string): Promise<boolean> {
  const products = await listProducts();
  const remaining = products.filter((product) => product.id !== id);
  if (remaining.length === products.length) return false;
  await save(remaining);
  return true;
}
