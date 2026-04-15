import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { series } from "@/lib/db/schema";
import { seriesSchema, type SeriesInput } from "@/lib/validation/series";

export const seriesService = {
  async list(userId: string) {
    return db.select().from(series).where(eq(series.userId, userId)).orderBy(desc(series.createdAt));
  },
  async get(userId: string, id: string) {
    return db.query.series.findFirst({ where: and(eq(series.userId, userId), eq(series.id, id)) });
  },
  async create(userId: string, input: SeriesInput) {
    const data = seriesSchema.parse(input);
    const [row] = await db.insert(series).values({ ...data, userId }).returning();
    return row;
  },
  async update(userId: string, id: string, input: SeriesInput) {
    const data = seriesSchema.parse(input);
    const [row] = await db
      .update(series)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(series.id, id), eq(series.userId, userId)))
      .returning();
    return row;
  }
};
