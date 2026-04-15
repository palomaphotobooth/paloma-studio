import { z } from "zod";

export const channelSchema = z.object({
  name: z.string().min(2),
  platform: z.string().min(2),
  status: z.enum(["active", "paused"])
});

export type ChannelInput = z.infer<typeof channelSchema>;
