import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { videoService } from "@/lib/services/video-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return NextResponse.json(await videoService.get(userId, id));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
