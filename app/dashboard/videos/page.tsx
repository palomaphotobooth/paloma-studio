"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type Video = { id: string; title: string; status: string; generationStep: string };

export default function VideosPage() {
  const query = useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  return (
    <Card>
      <CardHeader><CardTitle>Videos</CardTitle></CardHeader>
      <CardContent>
        {query.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {query.error && <p className="text-sm text-destructive">Failed to load videos.</p>}
        {query.data?.length === 0 && <p className="text-sm text-muted-foreground">No videos yet. Generate one from a series.</p>}
        <div className="space-y-3">
          {query.data?.map((video) => (
            <Link key={video.id} href={`/dashboard/videos/${video.id}`} className="flex flex-col justify-between gap-2 rounded-lg border p-3 hover:bg-muted/40 sm:flex-row sm:items-center">
              <p className="font-medium">{video.title}</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={video.generationStep} />
                <StatusBadge status={video.status} />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
