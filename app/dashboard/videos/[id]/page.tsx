"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type Video = { id: string; title: string; status: string; generationStep: string; scriptText: string; captionText: string };

export default function VideoDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useQuery<Video>({
    queryKey: ["video", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${params.id}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 2000
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{query.data?.title ?? "Video detail"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
        {query.error && <p className="text-sm text-destructive">Unable to load video.</p>}
        {query.data && (
          <>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={query.data.status} />
              <StatusBadge status={query.data.generationStep} />
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-1 text-sm font-semibold">Script</p>
              <p className="text-sm text-muted-foreground">{query.data.scriptText}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-1 text-sm font-semibold">Captions</p>
              <p className="text-sm text-muted-foreground">{query.data.captionText}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
