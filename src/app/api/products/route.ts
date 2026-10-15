import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await listProducts());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const currentPrice = Number(body.currentPrice);
    const targetPrice = body.targetPrice === "" || body.targetPrice === undefined
      ? null
      : Number(body.targetPrice);

    if (!name || !url || !Number.isFinite(currentPrice) || currentPrice <= 0) {
      return NextResponse.json({ error: "Preencha nome, URL e preço atual corretamente." }, { status: 400 });
    }
    if (targetPrice !== null && (!Number.isFinite(targetPrice) || targetPrice <= 0)) {
      return NextResponse.json({ error: "O preço-alvo precisa ser maior que zero." }, { status: 400 });
    }
    const product = await createProduct({ name, url, currentPrice, targetPrice });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível cadastrar o produto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
