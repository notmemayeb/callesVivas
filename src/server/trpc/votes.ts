import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "./trpc";

export const votesRouter = createTRPCRouter({
  vote: protectedProcedure
    .input(
      z.object({
        incidentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.vote.findUnique({
        where: {
          incidentId_userId_type: {
            incidentId: input.incidentId,
            userId: ctx.session.user.id,
            type: "SEVERITY",
          },
        },
      });

      if (existing) {
        await ctx.db.vote.delete({ where: { id: existing.id } });
        await ctx.db.incident.update({
          where: { id: input.incidentId },
          data: { votesCount: { decrement: 1 } },
        });
        return { voted: false };
      }

      await ctx.db.vote.create({
        data: {
          incidentId: input.incidentId,
          userId: ctx.session.user.id,
          type: "SEVERITY",
        },
      });
      await ctx.db.incident.update({
        where: { id: input.incidentId },
        data: { votesCount: { increment: 1 } },
      });

      return { voted: true };
    }),

  hasVoted: protectedProcedure
    .input(z.object({ incidentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const vote = await ctx.db.vote.findUnique({
        where: {
          incidentId_userId_type: {
            incidentId: input.incidentId,
            userId: ctx.session.user.id,
            type: "SEVERITY",
          },
        },
      });
      return !!vote;
    }),

  follow: protectedProcedure
    .input(z.object({ incidentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.follow.findUnique({
        where: {
          incidentId_userId: {
            incidentId: input.incidentId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (existing) {
        await ctx.db.follow.delete({ where: { id: existing.id } });
        await ctx.db.incident.update({
          where: { id: input.incidentId },
          data: { followersCount: { decrement: 1 } },
        });
        return { following: false };
      }

      await ctx.db.follow.create({
        data: {
          incidentId: input.incidentId,
          userId: ctx.session.user.id,
        },
      });
      await ctx.db.incident.update({
        where: { id: input.incidentId },
        data: { followersCount: { increment: 1 } },
      });

      return { following: true };
    }),

  isFollowing: protectedProcedure
    .input(z.object({ incidentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const follow = await ctx.db.follow.findUnique({
        where: {
          incidentId_userId: {
            incidentId: input.incidentId,
            userId: ctx.session.user.id,
          },
        },
      });
      return !!follow;
    }),
});
