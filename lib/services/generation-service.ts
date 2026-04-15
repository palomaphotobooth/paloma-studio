import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationJobs, videos } from "@/lib/db/schema";

const steps = ["queued", "scripting", "captions", "assembling", "complete"] as const;

type Step = (typeof steps)[number];

function stepFromElapsed(createdAt: Date): Step {
  const elapsedSeconds = Math.floor((Date.now() - createdAt.getTime()) / 1000);
  if (elapsedSeconds < 2) return "queued";
  if (elapsedSeconds < 4) return "scripting";
  if (elapsedSeconds < 6) return "captions";
  if (elapsedSeconds < 8) return "assembling";
  return "complete";
}

function topicStyle(topic: string) {
  const value = topic.toLowerCase();

  if (value.includes("fitness")) {
    return {
      hook: "Most fitness reels fail before second three.",
      tactic: "Use one visual benchmark and one tiny daily challenge.",
      cta: "Comment 'plan' for tomorrow's workout short."
    };
  }

  if (value.includes("finance") || value.includes("money")) {
    return {
      hook: "Your budget is bleeding in invisible subscriptions.",
      tactic: "Show one audit trick with an immediate monthly savings number.",
      cta: "Save this and run your own audit tonight."
    };
  }

  return {
    hook: "Creators lose retention by delaying the payoff.",
    tactic: "Lead with contrast, deliver one framework, then prove it fast.",
    cta: "Try this hook in your next short and measure watch time."
  };
}

function contentByStep(step: Step, topic: string) {
  const style = topicStyle(topic);

  if (step === "queued") {
    return {
      title: `Queued: ${topic}`,
      scriptText: `The ${topic} pipeline is queued and preparing assets.`,
      captionText: "Preparing caption generation..."
    };
  }

  if (step === "scripting") {
    return {
      title: `${topic} — Script Draft`,
      scriptText: `${style.hook} ${style.tactic}`,
      captionText: "Writing captions after script locks..."
    };
  }

  if (step === "captions") {
    return {
      title: `${topic} — Caption Pass`,
      scriptText: `${style.hook} ${style.tactic}`,
      captionText: `${style.cta}`
    };
  }

  if (step === "assembling") {
    return {
      title: `${topic} — Assembly`,
      scriptText: `${style.hook} ${style.tactic}`,
      captionText: "Syncing scenes, timing, and transitions..."
    };
  }

  return {
    title: `${topic} — Final Cut`,
    scriptText: `Hook: ${style.hook} Tactic: ${style.tactic}`,
    captionText: style.cta
  };
}

export const generationService = {
  async createJob(userId: string, videoId: string) {
    const [job] = await db.insert(generationJobs).values({ userId, videoId, status: "queued" }).returning();
    return job;
  },
  async syncJob(userId: string, videoId: string) {
    const job = await db.query.generationJobs.findFirst({
      where: and(eq(generationJobs.userId, userId), eq(generationJobs.videoId, videoId))
    });

    if (!job) return null;

    const video = await db.query.videos.findFirst({ where: and(eq(videos.id, videoId), eq(videos.userId, userId)) });
    if (!video) return null;

    const nextStep = stepFromElapsed(job.createdAt);
    const content = contentByStep(nextStep, video.topic);

    await db
      .update(generationJobs)
      .set({ status: nextStep, updatedAt: new Date() })
      .where(eq(generationJobs.id, job.id));

    await db
      .update(videos)
      .set({
        generationStep: nextStep,
        status: nextStep === "complete" ? "complete" : "processing",
        title: content.title,
        scriptText: content.scriptText,
        captionText: content.captionText,
        updatedAt: new Date()
      })
      .where(eq(videos.id, videoId));

    return nextStep;
  }
};
