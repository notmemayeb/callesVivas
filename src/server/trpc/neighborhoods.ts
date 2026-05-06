import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./trpc";

export const neighborhoodsRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.neighborhood.findMany({
      orderBy: { name: "asc" },
    });
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const neighborhood = await ctx.db.neighborhood.findUnique({
        where: { slug: input.slug },
      });

      if (!neighborhood) return null;

      const [stats, recentIncidents] = await Promise.all([
        ctx.db.incident.groupBy({
          by: ["status"],
          where: { neighborhoodId: neighborhood.id },
          _count: true,
        }),
        ctx.db.incident.findMany({
          where: {
            neighborhoodId: neighborhood.id,
            status: { not: "MODERATION" },
          },
          include: {
            category: true,
            media: { take: 1, where: { type: "PHOTO" } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

      return {
        ...neighborhood,
        stats,
        recentIncidents,
      };
    }),
});
