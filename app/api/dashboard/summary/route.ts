import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { dashboardService } from "@/lib/services/dashboard-service";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await dashboardService.summary(userId));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
