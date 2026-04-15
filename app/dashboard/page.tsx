"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type Summary = {
  stats: { channels: number; series: number; videos: number; completedVideos: number };
  recentVideos: Array<{ id: string; title: string; generationStep: string; status: string }>;
  activityLog: Array<{ id: string; status: string; updatedAt: string }>;
};

export default function DashboardPage() {
  const query = useQuery<Summary>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    }
  });

  const stats = query.data?.stats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["Channels", "Series", "Videos", "Completed"].map((label, index) => (
          <Card key={label}>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent>
              {query.isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold">{[stats?.channels, stats?.series, stats?.videos, stats?.completedVideos][index] ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent>
            {query.isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            )}
            {query.error && <p className="text-sm text-destructive">Failed to load recent activity.</p>}
            {query.data?.recentVideos.length === 0 && <p className="text-sm text-muted-foreground">No activity yet. Generate your first video.</p>}
            <ul className="space-y-3">
              {query.data?.recentVideos.map((video) => (
                <li key={video.id} className="rounded-lg border p-3">
                  <p className="font-medium">{video.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={video.generationStep} />
                    <StatusBadge status={video.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Activity log</CardTitle></CardHeader>
          <CardContent>
            {query.isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            )}
            <ul className="space-y-2">
              {query.data?.activityLog.map((activity) => (
                <li key={activity.id} className="flex items-center justify-between rounded-md border p-2">
                  <StatusBadge status={activity.status} />
                  <span className="text-xs text-muted-foreground">{new Date(activity.updatedAt).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
