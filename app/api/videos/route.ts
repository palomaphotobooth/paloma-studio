import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { videoService } from "@/lib/services/video-service";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await videoService.list(userId));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
