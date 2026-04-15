import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { channels, generationJobs, series, videos } from "@/lib/db/schema";

export const dashboardService = {
  async summary(userId: string) {
    const [channelRows, seriesRows, videoRows, activities] = await Promise.all([
      db.select().from(channels).where(eq(channels.userId, userId)),
      db.select().from(series).where(eq(series.userId, userId)),
      db.select().from(videos).where(eq(videos.userId, userId)),
      db
        .select({ id: generationJobs.id, status: generationJobs.status, updatedAt: generationJobs.updatedAt })
        .from(generationJobs)
        .where(eq(generationJobs.userId, userId))
        .orderBy(desc(generationJobs.updatedAt))
        .limit(8)
    ]);

    return {
      stats: {
        channels: channelRows.length,
        series: seriesRows.length,
        videos: videoRows.length,
        completedVideos: videoRows.filter((video) => video.status === "complete").length
      },
      recentVideos: [...videoRows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
      activityLog: activities
    };
  }
};
