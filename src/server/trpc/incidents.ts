import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  moderatorProcedure,
} from "./trpc";
import { IncidentStatus, Prisma } from "@/generated/prisma";

export const incidentsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        neighborhoodId: z.string().optional(),
        status: z.nativeEnum(IncidentStatus).optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { categoryId, neighborhoodId, status, cursor, limit } = input;

      const userId = ctx.session?.user?.id;
      const role = ctx.session?.user?.role;
      const isModerator = role === "MODERATOR" || role === "COORDINATOR";

      const publicStatuses: IncidentStatus[] = [
        "PUBLISHED", "IN_CONTACT", "ADMIN_CONTACT",
        "MEASURES_ANNOUNCED", "AWAITING_RESPONSE", "RESOLVED", "ABANDONED",
      ];

      const where: Prisma.IncidentWhereInput = {
        ...(categoryId && { categoryId }),
        ...(neighborhoodId && { neighborhoodId }),
      };

      if (status) {
        where.status = status;
      } else if (isModerator) {
        // Moderators see everything
      } else if (userId) {
        where.AND = [
          {
            OR: [
              { status: { in: publicStatuses } },
              { authorId: userId, status: "DETECTED" },
            ],
          },
        ];
      } else {
        where.status = { in: publicStatuses };
      }

      const items = await ctx.db.incident.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where,
        include: {
          category: true,
          neighborhood: true,
          author: { select: { id: true, name: true, image: true } },
          media: { take: 1, where: { type: "PHOTO" } },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const incident = await ctx.db.incident.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          neighborhood: true,
          author: { select: { id: true, name: true, image: true } },
          media: true,
          statusHistory: {
            include: {
              author: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          journalisticContent: true,
          adminContacts: {
            orderBy: { contactDate: "asc" },
          },
          _count: {
            select: { comments: true, votes: true, follows: true },
          },
        },
      });

      if (!incident) return null;

      if (incident.status === "DETECTED") {
        const userId = ctx.session?.user?.id;
        const role = ctx.session?.user?.role;
        const isModerator = role === "MODERATOR" || role === "COORDINATOR";
        if (incident.authorId !== userId && !isModerator) return null;
      }

      await ctx.db.incident.update({
        where: { id: input.id },
        data: { visitsCount: { increment: 1 } },
      });

      return incident;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(80),
        description: z.string().min(10).max(500),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        addressText: z.string().optional(),
        categoryId: z.string(),
        neighborhoodId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const incident = await ctx.db.incident.create({
        data: {
          ...input,
          authorId: ctx.session.user.id,
          status: "DETECTED",
        },
      });

      await ctx.db.statusHistory.create({
        data: {
          incidentId: incident.id,
          newStatus: "DETECTED",
          authorId: ctx.session.user.id,
          note: "Incidencia creada",
        },
      });

      return incident;
    }),

  updateStatus: moderatorProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(IncidentStatus),
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
        data: { status: input.status },
      });

      await ctx.db.statusHistory.create({
        data: {
          incidentId: input.id,
          previousStatus: current.status,
          newStatus: input.status,
          authorId: ctx.session.user.id,
          note: input.note,
        },
      });

      return updated;
    }),

  delete: moderatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.incident.delete({ where: { id: input.id } });
    }),

  top: publicProcedure
    .input(
      z.object({
        period: z.enum(["today", "week", "month"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let since: Date;

      switch (input.period) {
        case "today":
          since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          since = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      return ctx.db.incident.findMany({
        where: {
          createdAt: { gte: since },
          status: { notIn: ["DETECTED", "MODERATION"] },
        },
        include: {
          category: true,
          neighborhood: true,
          author: { select: { id: true, name: true, image: true } },
          media: { take: 1, where: { type: "PHOTO" } },
        },
        orderBy: { votesCount: "desc" },
        take: 5,
      });
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.incident.findMany({
        where: {
          status: { notIn: ["DETECTED", "MODERATION"] },
          OR: [
            { title: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        },
        include: {
          category: true,
          neighborhood: true,
          media: { take: 1, where: { type: "PHOTO" } },
        },
        orderBy: { votesCount: "desc" },
        take: input.limit,
      });
    }),
});
