import { createTRPCRouter, createCallerFactory } from "./trpc";
import { incidentsRouter } from "./incidents";
import { votesRouter } from "./votes";
import { commentsRouter } from "./comments";
import { neighborhoodsRouter } from "./neighborhoods";
import { categoriesRouter } from "./categories";
import { usersRouter } from "./users";
import { moderationRouter } from "./moderation";
import { journalistRouter } from "./journalist";

export const appRouter = createTRPCRouter({
  incidents: incidentsRouter,
  votes: votesRouter,
  comments: commentsRouter,
  neighborhoods: neighborhoodsRouter,
  categories: categoriesRouter,
  users: usersRouter,
  moderation: moderationRouter,
  journalist: journalistRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
