import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  moderatorProcedure,
} from "./trpc";

export const commentsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        incidentId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        sort: z.enum(["recent", "popular"]).default("recent"),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.comment.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: { incidentId: input.incidentId },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy:
          input.sort === "recent"
            ? { createdAt: "desc" }
            : { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  create: protectedProcedure
    .input(
      z.object({
        incidentId: z.string(),
        text: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.create({
        data: {
          incidentId: input.incidentId,
          userId: ctx.session.user.id,
          text: input.text,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });
    }),

  delete: moderatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.delete({ where: { id: input.id } });
    }),
});
