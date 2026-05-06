import { z } from "zod";
import {
  createTRPCRouter,
  moderatorProcedure,
} from "./trpc";
import { IncidentStatus } from "@/generated/prisma";

export const moderationRouter = createTRPCRouter({
  queue: moderatorProcedure
    .input(
      z.object({
        status: z.nativeEnum(IncidentStatus).optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.incident.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          status: input.status ?? "DETECTED",
        },
        include: {
          category: true,
          neighborhood: true,
          author: { select: { id: true, name: true, image: true, email: true } },
          media: { take: 3, where: { type: "PHOTO" } },
          _count: { select: { votes: true, comments: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  approve: moderatorProcedure
    .input(
      z.object({
        id: z.string(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.db.incident.findUniqueOrThrow({
        where: { id: input.id },
        select: { status: true },
      });

      const updated = await ctx.db.incident.update({
        where: { id: input.id },
        data: { status: "PUBLISHED" },
      });

      await ctx.db.statusHistory.create({
        data: {
          incidentId: input.id,
          previousStatus: current.status,
          newStatus: "PUBLISHED",
          authorId: ctx.session.user.id,
          note: input.note ?? "Aprobada por moderador",
        },
      });

      return updated;
    }),

  reject: moderatorProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.db.incident.findUniqueOrThrow({
        where: { id: input.id },
        select: { status: true },
      });

      const updated = await ctx.db.incident.update({
        where: { id: input.id },
        data: { status: "ABANDONED" },
      });

      await ctx.db.statusHistory.create({
        data: {
          incidentId: input.id,
          previousStatus: current.status,
          newStatus: "ABANDONED",
          authorId: ctx.session.user.id,
          note: `Rechazada: ${input.reason}`,
        },
      });

      return updated;
    }),

  reclassify: moderatorProcedure
    .input(
      z.object({
        id: z.string(),
        categoryId: z.string(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.incident.update({
        where: { id: input.id },
        data: { categoryId: input.categoryId },
      });
    }),

  stats: moderatorProcedure.query(async ({ ctx }) => {
    const [pending, approved, rejected, total] = await Promise.all([
      ctx.db.incident.count({ where: { status: "DETECTED" } }),
      ctx.db.incident.count({ where: { status: "PUBLISHED" } }),
      ctx.db.incident.count({ where: { status: "ABANDONED" } }),
      ctx.db.incident.count(),
    ]);

    return { pending, approved, rejected, total };
  }),
});
