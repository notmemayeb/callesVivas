import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  coordinatorProcedure,
} from "./trpc";
import { UserRole } from "@/generated/prisma";

export const usersRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          activityPoints: true,
          createdAt: true,
          neighborhood: { select: { id: true, name: true, slug: true } },
          _count: {
            select: { incidents: true, votes: true, comments: true },
          },
        },
      });
      return user;
    }),

  myIncidents: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.incident.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: { authorId: ctx.session.user.id },
        include: {
          category: true,
          neighborhood: true,
          media: { take: 1, where: { type: "PHOTO" } },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  myFollowed: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const follows = await ctx.db.follow.findMany({
        where: { userId: ctx.session.user.id },
        select: { incidentId: true },
      });
      const incidentIds = follows.map((f) => f.incidentId);

      if (incidentIds.length === 0) return { items: [], nextCursor: undefined };

      const items = await ctx.db.incident.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: { id: { in: incidentIds } },
        include: {
          category: true,
          neighborhood: true,
          media: { take: 1, where: { type: "PHOTO" } },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  list: coordinatorProcedure
    .input(
      z.object({
        role: z.nativeEnum(UserRole).optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          ...(input.role && { role: input.role }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { email: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          activityPoints: true,
          createdAt: true,
          _count: { select: { incidents: true, votes: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  changeRole: coordinatorProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.nativeEnum(UserRole),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),

  stats: coordinatorProcedure.query(async ({ ctx }) => {
    const [total, citizens, moderators, journalists, coordinators] =
      await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { role: "CITIZEN" } }),
        ctx.db.user.count({ where: { role: "MODERATOR" } }),
        ctx.db.user.count({ where: { role: "JOURNALIST" } }),
        ctx.db.user.count({ where: { role: "COORDINATOR" } }),
      ]);

    return { total, citizens, moderators, journalists, coordinators };
  }),
});
