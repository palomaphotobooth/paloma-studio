"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type Channel = { id: string; name: string; platform: string; status: "active" | "paused" };

export default function ChannelsPage() {
  const query = useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const res = await fetch("/api/channels");
      if (!res.ok) throw new Error("Failed to load channels");
      return res.json();
    }
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Channels</CardTitle>
        <Button asChild><Link href="/dashboard/channels/new">New channel</Link></Button>
      </CardHeader>
      <CardContent>
        {query.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {query.error && <p className="text-sm text-destructive">Could not load channels.</p>}
        {query.data?.length === 0 && <p className="text-sm text-muted-foreground">No channels yet. Create one to begin.</p>}
        <div className="space-y-3">
          {query.data?.map((channel) => (
            <div key={channel.id} className="flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">{channel.name}</p>
                <p className="text-sm text-muted-foreground">{channel.platform}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={channel.status} />
                <Button asChild size="sm" variant="outline"><Link href={`/dashboard/channels/${channel.id}/edit`}>Edit</Link></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
