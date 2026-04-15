import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { channels } from "@/lib/db/schema";
import { seriesService } from "@/lib/services/series-service";
import { SeriesForm } from "@/components/dashboard/series-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const item = await seriesService.get(userId, id);
  if (!item) notFound();

  const channelRows = await db.select({ id: channels.id, name: channels.name }).from(channels).where(eq(channels.userId, userId));

  return (
    <Card>
      <CardHeader><CardTitle>Edit series</CardTitle></CardHeader>
      <CardContent>
        <SeriesForm id={id} channels={channelRows} initial={{ channelId: item.channelId, name: item.name, description: item.description }} />
      </CardContent>
    </Card>
  );
}
