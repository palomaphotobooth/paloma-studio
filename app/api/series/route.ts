import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { seriesService } from "@/lib/services/series-service";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await seriesService.list(userId));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    return NextResponse.json(await seriesService.create(userId, body));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
