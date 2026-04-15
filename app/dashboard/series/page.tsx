"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

type Series = { id: string; name: string; description: string };

export default function SeriesPage() {
  const query = useQuery<Series[]>({
    queryKey: ["series"],
    queryFn: async () => {
      const res = await fetch("/api/series");
      if (!res.ok) throw new Error("Failed to load series");
      return res.json();
    }
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Series</CardTitle>
        <Button asChild><Link href="/dashboard/series/new">New series</Link></Button>
      </CardHeader>
      <CardContent>
        {query.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {query.error && <p className="text-sm text-destructive">Could not load series.</p>}
        {query.data?.length === 0 && <p className="text-sm text-muted-foreground">No series found. Create one to structure your content.</p>}
        <div className="space-y-3">
          {query.data?.map((item) => (
            <div key={item.id} className="flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="active" />
                <Button asChild size="sm" variant="outline"><Link href={`/dashboard/series/${item.id}`}>Open</Link></Button>
                <Button asChild size="sm" variant="outline"><Link href={`/dashboard/series/${item.id}/edit`}>Edit</Link></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
