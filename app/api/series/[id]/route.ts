import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { seriesService } from "@/lib/services/series-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return NextResponse.json(await seriesService.get(userId, id));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const { id } = await params;
    return NextResponse.json(await seriesService.update(userId, id, body));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
