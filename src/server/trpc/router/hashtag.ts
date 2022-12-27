import { publicProcedure } from "./../trpc";
import { router } from "../trpc";
import { prisma } from "@/src/server/db/client";

export const hashtagRouter = router({
  getAllNames: publicProcedure.query(async () => {
    return await prisma?.hashtag.findMany({ select: { id: true, name: true } });
  }),
});
