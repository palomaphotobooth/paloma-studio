import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { channels, generationJobs, series, videos } from "@/lib/db/schema";

async function seed() {
  const userId = "demo-user";

  const channelA = randomUUID();
  const channelB = randomUUID();

  const seriesA = randomUUID();
  const seriesB = randomUUID();
  const seriesC = randomUUID();

  await db.insert(channels).values([
    { id: channelA, userId, name: "ShortForge Labs", platform: "YouTube Shorts", status: "active" },
    { id: channelB, userId, name: "MonetizeMinute", platform: "TikTok", status: "paused" }
  ]);

  await db.insert(series).values([
    { id: seriesA, userId, channelId: channelA, name: "Creator Growth", description: "Experiments for hooks and retention." },
    { id: seriesB, userId, channelId: channelA, name: "Fitness Flash", description: "Fast routines and wellness tips." },
    { id: seriesC, userId, channelId: channelB, name: "Money Myths", description: "Debunking personal finance misconceptions." }
  ]);

  const videoRows = [
    { seriesId: seriesA, topic: "Creator Growth", title: "Hook Framework 1", step: "complete" as const, status: "complete" as const },
    { seriesId: seriesA, topic: "Creator Growth", title: "Hook Framework 2", step: "assembling" as const, status: "processing" as const },
    { seriesId: seriesB, topic: "Fitness Flash", title: "30s Core Fix", step: "complete" as const, status: "complete" as const },
    { seriesId: seriesB, topic: "Fitness Flash", title: "Mobility Warmup", step: "captions" as const, status: "processing" as const },
    { seriesId: seriesC, topic: "Money Myths", title: "Subscription Leak", step: "scripting" as const, status: "processing" as const },
    { seriesId: seriesC, topic: "Money Myths", title: "Emergency Fund Rule", step: "queued" as const, status: "queued" as const }
  ];

  for (const item of videoRows) {
    const videoId = randomUUID();
    await db.insert(videos).values({
      id: videoId,
      userId,
      seriesId: item.seriesId,
      topic: item.topic,
      title: item.title,
      scriptText: `${item.topic} script draft for ${item.title}`,
      captionText: `${item.topic} caption draft for ${item.title}`,
      generationStep: item.step,
      status: item.status
    });

    await db.insert(generationJobs).values({
      userId,
      videoId,
      status: item.step
    });
  }

  console.log("Seed complete: 2 channels, 3 series, 6 videos");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
