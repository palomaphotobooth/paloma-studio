import { eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { channels } from "@/lib/db/schema";
import { SeriesForm } from "@/components/dashboard/series-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewSeriesPage() {
  const userId = await requireUserId();
  const channelRows = await db.select({ id: channels.id, name: channels.name }).from(channels).where(eq(channels.userId, userId));

  return (
    <Card>
      <CardHeader><CardTitle>Create series</CardTitle></CardHeader>
      <CardContent>
        {channelRows.length === 0 ? <p className="text-sm text-muted-foreground">Create a channel first.</p> : <SeriesForm channels={channelRows} />}
      </CardContent>
    </Card>
  );
}
