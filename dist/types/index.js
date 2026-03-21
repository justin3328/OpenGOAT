import { z } from 'zod';
export const PlaybookSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    description: z.string(),
    paths: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        estimatedWeeks: z.number().int().positive(),
        confidenceScore: z.number().min(0).max(100),
        requiredHoursPerWeek: z.number().positive(),
        milestones: z.array(z.object({
            week: z.number(),
            description: z.string(),
            metric: z.number()
        })),
        tags: z.array(z.string()),
        missionTemplates: z.array(z.object({
            title: z.string(),
            description: z.string(),
            estimatedHours: z.number(),
            xp: z.number()
        }))
    }))
});
