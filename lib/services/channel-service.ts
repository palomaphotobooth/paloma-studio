import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { channels } from "@/lib/db/schema";
import { channelSchema, type ChannelInput } from "@/lib/validation/channel";

export const channelService = {
  async list(userId: string) {
    return db.select().from(channels).where(eq(channels.userId, userId)).orderBy(desc(channels.createdAt));
  },
  async get(userId: string, id: string) {
    return db.query.channels.findFirst({ where: and(eq(channels.userId, userId), eq(channels.id, id)) });
  },
  async create(userId: string, input: ChannelInput) {
    const data = channelSchema.parse(input);
    const [row] = await db.insert(channels).values({ ...data, userId }).returning();
    return row;
  },
  async update(userId: string, id: string, input: ChannelInput) {
    const data = channelSchema.parse(input);
    const [row] = await db
      .update(channels)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(channels.id, id), eq(channels.userId, userId)))
      .returning();
    return row;
  }
};
