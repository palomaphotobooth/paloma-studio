import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth";
import { channelService } from "@/lib/services/channel-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelForm } from "@/components/dashboard/channel-form";

export default async function EditChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  const { id } = await params;
  const channel = await channelService.get(userId, id);
  if (!channel) notFound();

  return (
    <Card>
      <CardHeader><CardTitle>Edit channel</CardTitle></CardHeader>
      <CardContent><ChannelForm id={id} initial={{ name: channel.name, platform: channel.platform, status: channel.status }} /></CardContent>
    </Card>
  );
}
