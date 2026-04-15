import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { channelService } from "@/lib/services/channel-service";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await channelService.list(userId));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    return NextResponse.json(await channelService.create(userId, body));
  } catch (error) {
    return NextResponse.json({ error: "Invalid request", detail: `${error}` }, { status: 400 });
  }
}
