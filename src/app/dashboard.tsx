"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatBRL, storeMeta } from "@/lib/catalog";
import type { Product } from "@/lib/types";

type FormState = { name: string; url: string; currentPrice: string; targetPrice: string };
const emptyForm: FormState = { name: "", url: "", currentPrice: "", targetPrice: "" };

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="spark-empty" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = max === min ? 50 : 88 - ((value - min) / (max - min)) * 72;
    return `${x},${y}`;
  }).join(" ");
  const isDown = values.at(-1)! <= values[0];
  return (
    <svg className={`sparkline ${isDown ? "down" : "up"}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Histórico de preço">
      <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ProductCard({ product, onPrice, onDelete }: {
  product: Product;
  onPrice: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  const meta = storeMeta[product.store];
  const difference = product.previousPrice ? product.previousPrice - product.currentPrice : 0;
  const percentage = product.previousPrice && difference > 0 ? (difference / product.previousPrice) * 100 : 0;
  const reachedTarget = product.targetPrice !== null && product.currentPrice <= product.targetPrice;

  return (
    <article className="product-card">
      <div className="product-topline">
        <span className={`store-chip ${product.store}`}><b>{meta.initial}</b>{meta.name}</span>
        <button className="icon-button" aria-label={`Excluir ${product.name}`} onClick={() => onDelete(product)}>×</button>
      </div>
      <div className="product-body">
        <div>
          <h3>{product.name}</h3>
          <a href={product.url} target="_blank" rel="noreferrer">Ver produto ↗</a>
        </div>
        <div className="price-block">
          <span>Preço atual</span>
          <strong>{formatBRL(product.currentPrice)}</strong>
          {percentage > 0 && <em>↓ {percentage.toFixed(0)}% desde a última consulta</em>}
        </div>
      </div>
      <div className="history-row">
        <div className="history-copy">
          <span>Menor preço</span>
          <b>{formatBRL(product.lowestPrice)}</b>
        </div>
        <Sparkline values={product.history.map((point) => point.price)} />
      </div>
      <div className="product-footer">
        {product.targetPrice ? (
          <span className={reachedTarget ? "target hit" : "target"}>
            {reachedTarget ? "✓ Alerta acionado" : `Alvo: ${formatBRL(product.targetPrice)}`}
          </span>
        ) : <span className="target">Sem preço-alvo</span>}
        <button className="secondary-button" onClick={() => onPrice(product)}>Registrar preço</button>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    const response = await fetch("/api/products", { cache: "no-store" });
    const data = await response.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { void loadProducts(); }, []);

  const stats = useMemo(() => {
    const alerts = products.filter((product) => product.targetPrice !== null && product.currentPrice <= product.targetPrice).length;
    const totalDrop = products.reduce((sum, product) => {
      const highest = Math.max(...product.history.map((point) => point.price));
      return sum + Math.max(0, highest - product.currentPrice);
    }, 0);
    return { alerts, totalDrop };
  }, [products]);

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Não foi possível cadastrar o produto.");
      return;
    }
    setProducts((current) => [data, ...current]);
    setForm(emptyForm);
    setMessage("Produto adicionado ao monitoramento.");
  }

  async function registerManualPrice(product: Product) {
    const input = window.prompt(`Novo preço para “${product.name}”`, String(product.currentPrice).replace(".", ","));
    if (input === null) return;
    const price = Number(input.replace(".", "").replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      setError("Informe um preço válido.");
      return;
    }
    const response = await fetch(`/api/products/${product.id}/price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Não foi possível registrar o preço.");
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? data : item));
    setMessage("Preço registrado e histórico atualizado.");
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Remover “${product.name}” do monitoramento?`)) return;
    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (response.ok) {
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage("Produto removido.");
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/"><span>m</span>maisdesconto</a>
        <div className="topbar-actions"><span className="status-dot" />Monitoramento ativo</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">SEU RADAR DE PREÇOS</p>
          <h1>Compre no melhor<br />momento.</h1>
          <p className="hero-copy">Acompanhe preços na Amazon, Mercado Livre e Shopee. Quando baixar, você sabe primeiro.</p>
        </div>
        <div className="store-orbs" aria-label="Lojas monitoradas">
          <span className="orb amazon">a</span><span className="orb mercado">M</span><span className="orb shopee">S</span>
        </div>
      </section>

      <section className="metrics" aria-label="Resumo">
        <div><span>Produtos monitorados</span><strong>{products.length}</strong></div>
        <div><span>Alertas liberados</span><strong className={stats.alerts ? "warm" : ""}>{stats.alerts}</strong></div>
        <div><span>Queda acumulada</span><strong className="green">{formatBRL(stats.totalDrop)}</strong></div>
      </section>

      <section className="content-grid">
        <div className="products-area">
          <div className="section-heading">
            <div><p className="eyebrow">SEUS ACOMPANHAMENTOS</p><h2>Produtos monitorados</h2></div>
            <button className="text-button" onClick={() => void loadProducts()}>Atualizar lista ↻</button>
          </div>
          {loading ? <div className="empty-state">Carregando produtos…</div> : products.length ? (
            <div className="product-grid">
              {products.map((product) => <ProductCard key={product.id} product={product} onPrice={registerManualPrice} onDelete={deleteProduct} />)}
            </div>
          ) : <div className="empty-state">Ainda não há produtos. Cadastre o primeiro no formulário ao lado.</div>}
        </div>

        <aside className="add-card">
          <p className="eyebrow">NOVO MONITORAMENTO</p>
          <h2>Adicionar produto</h2>
          <p>Comece pela URL e pelo preço que você viu agora.</p>
          <form onSubmit={addProduct}>
            <label>Nome do produto<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Echo Dot 5ª geração" /></label>
            <label>Link do produto<input required type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://..." /></label>
            <div className="form-row">
              <label>Preço atual<input required inputMode="decimal" value={form.currentPrice} onChange={(event) => setForm({ ...form, currentPrice: event.target.value })} placeholder="299,90" /></label>
              <label>Seu preço-alvo<input inputMode="decimal" value={form.targetPrice} onChange={(event) => setForm({ ...form, targetPrice: event.target.value })} placeholder="249,90" /></label>
            </div>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Adicionando…" : "Começar a monitorar →"}</button>
          </form>
          <p className="form-note">Aceitamos links da Amazon, Mercado Livre e Shopee.</p>
        </aside>
      </section>
      {(message || error) && <div className={`toast ${error ? "error" : ""}`}>{error || message}<button onClick={() => { setMessage(""); setError(""); }}>×</button></div>}
    </main>
  );
}
