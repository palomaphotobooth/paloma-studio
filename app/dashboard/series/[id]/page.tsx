"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/providers/toast-provider";

type Series = { id: string; name: string; description: string };

export default function SeriesDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isGenerating, setGenerating] = useState(false);
  const { toast } = useToast();

  const query = useQuery<Series>({
    queryKey: ["series", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/series/${params.id}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    }
  });

  const generate = async () => {
    setGenerating(true);
    const res = await fetch("/api/generation", { method: "POST", body: JSON.stringify({ seriesId: params.id }) });
    if (!res.ok) {
      setGenerating(false);
      toast({ title: "Generation failed", variant: "error" });
      return;
    }
    const video = await res.json();
    toast({ title: "Video generation started", description: "Pipeline moved to queued", variant: "success" });
    setGenerating(false);
    router.push(`/dashboard/videos/${video.id}`);
  };

  return (
    <Card>
      <CardHeader><CardTitle>{query.data?.name ?? "Series"}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading && <Skeleton className="h-20 w-full" />}
        {query.error && <p className="text-sm text-destructive">Unable to load series.</p>}
        {query.data && (
          <>
            <StatusBadge status="active" />
            <p className="text-muted-foreground">{query.data.description}</p>
          </>
        )}
        <Button onClick={generate} disabled={isGenerating}>{isGenerating ? "Generating..." : "Generate Video"}</Button>
      </CardContent>
    </Card>
  );
}
