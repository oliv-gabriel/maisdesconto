import { NextResponse } from "next/server";
import { registerPrice } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Informe um preço válido." }, { status: 400 });
  }
  const product = await registerPrice(id, price);
  if (!product) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  return NextResponse.json(product);
}
