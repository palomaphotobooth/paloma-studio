import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { series, videos } from "@/lib/db/schema";
import { generationService } from "@/lib/services/generation-service";

export const videoService = {
  async list(userId: string) {
    return db.select().from(videos).where(eq(videos.userId, userId)).orderBy(desc(videos.createdAt));
  },
  async get(userId: string, id: string) {
    await generationService.syncJob(userId, id);
    return db.query.videos.findFirst({ where: and(eq(videos.userId, userId), eq(videos.id, id)) });
  },
  async createForGeneration(userId: string, seriesId: string) {
    const seriesRecord = await db.query.series.findFirst({ where: and(eq(series.id, seriesId), eq(series.userId, userId)) });
    const topic = seriesRecord?.name ?? "Creator Growth";

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        seriesId,
        topic,
        title: `Pipeline Preview: ${topic}`,
        scriptText: `Preparing a script for ${topic}.`,
        captionText: "Generating captions...",
        status: "queued",
        generationStep: "queued"
      })
      .returning();

    await generationService.createJob(userId, video.id);
    return video;
  }
};
