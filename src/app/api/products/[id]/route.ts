import { NextResponse } from "next/server";
import { removeProduct } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const removed = await removeProduct(id);
  return removed
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
}
