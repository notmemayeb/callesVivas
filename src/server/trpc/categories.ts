import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./trpc";
import { MacroCategory } from "@/generated/prisma";

export const categoriesRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      orderBy: [{ macroCategory: "asc" }, { name: "asc" }],
    });
  }),

  byMacroCategory: publicProcedure
    .input(z.object({ macroCategory: z.nativeEnum(MacroCategory) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: { macroCategory: input.macroCategory },
        orderBy: { name: "asc" },
      });
    }),
});
