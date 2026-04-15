import { z } from "zod";

export const seriesSchema = z.object({
  channelId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().min(10)
});

export type SeriesInput = z.infer<typeof seriesSchema>;
