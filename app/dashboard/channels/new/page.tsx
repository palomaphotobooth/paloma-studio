import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelForm } from "@/components/dashboard/channel-form";

export default function NewChannelPage() {
  return <Card><CardHeader><CardTitle>Create channel</CardTitle></CardHeader><CardContent><ChannelForm /></CardContent></Card>;
}
