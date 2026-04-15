import { z } from "zod";

export const generationSchema = z.object({
  seriesId: z.string().uuid()
});

export type GenerationInput = z.infer<typeof generationSchema>;
