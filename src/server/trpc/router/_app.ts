import { hashtagRouter } from "./hashtag";
import { projectRouter } from "./project";
import { router } from "../trpc";
import { commentRouter } from "./comment";

export const appRouter = router({
  project: projectRouter,
  hashtag: hashtagRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
