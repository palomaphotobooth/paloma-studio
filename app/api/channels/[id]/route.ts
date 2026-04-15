import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { channelService } from "@/lib/services/channel-service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const { id } = await params;
    return NextResponse.json(await channelService.update(userId, id, body));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
