import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  journalistProcedure,
} from "./trpc";
import {
  IncidentStatus,
  JournalisticContentType,
  ContactType,
} from "@/generated/prisma";

export const journalistRouter = createTRPCRouter({
  assigned: journalistProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.incident.findMany({
        where: {
          status: { in: ["PUBLISHED", "IN_CONTACT", "ADMIN_CONTACT"] },
        },
        include: {
          category: true,
          neighborhood: true,
          author: { select: { id: true, name: true, image: true } },
          media: { take: 1, where: { type: "PHOTO" } },
          _count: { select: { votes: true, comments: true, adminContacts: true } },
        },
        orderBy: { votesCount: "desc" },
        take: input.limit,
      });
    }),

  addContent: journalistProcedure
    .input(
      z.object({
        incidentId: z.string(),
        type: z.nativeEnum(JournalisticContentType),
        title: z.string().min(1).max(200),
        newspaperUrl: z.string().min(1).optional(),
        contentUrl: z.string().min(1).optional(),
        duration: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const content = await ctx.db.journalisticContent.create({
        data: {
          incidentId: input.incidentId,
          journalistId: ctx.session.user.id,
          type: input.type,
          title: input.title,
          newspaperUrl: input.newspaperUrl,
          contentUrl: input.contentUrl,
          duration: input.duration,
        },
      });

      const incident = await ctx.db.incident.findUniqueOrThrow({
        where: { id: input.incidentId },
        select: { status: true },
      });

      if (incident.status === "PUBLISHED") {
        await ctx.db.incident.update({
          where: { id: input.incidentId },
          data: { status: "IN_CONTACT" },
        });
        await ctx.db.statusHistory.create({
          data: {
            incidentId: input.incidentId,
            previousStatus: "PUBLISHED",
            newStatus: "IN_CONTACT",
            authorId: ctx.session.user.id,
            note: `Contenido añadido: ${input.title}`,
          },
        });
      }

      return content;
    }),

  listContent: publicProcedure
    .input(
      z.object({
        incidentId: z.string().optional(),
        type: z.nativeEnum(JournalisticContentType).optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.journalisticContent.findMany({
        where: {
          ...(input.incidentId && { incidentId: input.incidentId }),
          ...(input.type && { type: input.type }),
        },
        include: {
          incident: {
            select: {
              id: true,
              title: true,
              status: true,
              media: { take: 1, where: { type: "PHOTO" } },
            },
          },
          journalist: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  updateContent: journalistProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        newspaperUrl: z.string().min(1).optional(),
        contentUrl: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const content = await ctx.db.journalisticContent.findUniqueOrThrow({
        where: { id: input.id },
      });
      if (
        content.journalistId !== ctx.session.user.id &&
        ctx.session.user.role !== "COORDINATOR"
      ) {
        throw new Error("No autorizado");
      }
      const { id, ...data } = input;
      return ctx.db.journalisticContent.update({
        where: { id },
        data,
      });
    }),

  deleteContent: journalistProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const content = await ctx.db.journalisticContent.findUniqueOrThrow({
        where: { id: input.id },
      });
      if (
        content.journalistId !== ctx.session.user.id &&
        ctx.session.user.role !== "COORDINATOR"
      ) {
        throw new Error("No autorizado");
      }
      return ctx.db.journalisticContent.delete({ where: { id: input.id } });
    }),

  addAdminContact: journalistProcedure
    .input(
      z.object({
        incidentId: z.string(),
        agency: z.string().min(1),
        contactPerson: z.string().optional(),
        type: z.nativeEnum(ContactType),
        summary: z.string().optional(),
        response: z.string().optional(),
        documentUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.db.adminContact.create({
        data: {
          incidentId: input.incidentId,
          journalistId: ctx.session.user.id,
          agency: input.agency,
          contactPerson: input.contactPerson,
          type: input.type,
          summary: input.summary,
          response: input.response,
          documentUrl: input.documentUrl,
        },
      });

      const incident = await ctx.db.incident.findUniqueOrThrow({
        where: { id: input.incidentId },
        select: { status: true },
      });

      if (
        incident.status === "PUBLISHED" ||
        incident.status === "IN_CONTACT"
      ) {
        await ctx.db.incident.update({
          where: { id: input.incidentId },
          data: { status: "ADMIN_CONTACT" },
        });
        await ctx.db.statusHistory.create({
          data: {
            incidentId: input.incidentId,
            previousStatus: incident.status,
            newStatus: "ADMIN_CONTACT",
            authorId: ctx.session.user.id,
            note: `Contacto administrativo: ${input.agency}`,
          },
        });
      }

      return contact;
    }),

  listAdminContacts: publicProcedure
    .input(z.object({ incidentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.adminContact.findMany({
        where: { incidentId: input.incidentId },
        include: {
          journalist: { select: { id: true, name: true, image: true } },
        },
        orderBy: { contactDate: "desc" },
      });
    }),

  changeStatus: journalistProcedure
    .input(
      z.object({
        incidentId: z.string(),
        status: z.nativeEnum(IncidentStatus),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.db.incident.findUniqueOrThrow({
        where: { id: input.incidentId },
        select: { status: true },
      });

      const updated = await ctx.db.incident.update({
        where: { id: input.incidentId },
        data: { status: input.status },
      });

      await ctx.db.statusHistory.create({
        data: {
          incidentId: input.incidentId,
          previousStatus: current.status,
          newStatus: input.status,
          authorId: ctx.session.user.id,
          note: input.note,
        },
      });

      return updated;
    }),
});
