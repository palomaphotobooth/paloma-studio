import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { videoService } from "@/lib/services/video-service";
import { generationSchema } from "@/lib/validation/generation";

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = generationSchema.parse(await req.json());
    return NextResponse.json(await videoService.createForGeneration(userId, body.seriesId));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
