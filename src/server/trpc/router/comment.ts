import { publicProcedure } from "./../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/src/server/db/client";

export const commentRouter = router({
  ofProject: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const comments = await prisma?.comment.findMany({
        where: {
          projectId: input.projectId,

          NOT: { userId: ctx.session?.user?.id },
        },
        select: {
          body: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
          id: true,
        },

        orderBy: { createdAt: "desc" },
      });

      let usersComments;

      if (ctx.session?.user) {
        usersComments = await prisma?.comment.findMany({
          where: { userId: ctx.session.user.id, projectId: input.projectId },
          select: {
            body: true,
            createdAt: true,
            user: { select: { name: true, image: true } },
            id: true,
          },

          orderBy: { createdAt: "desc" },
        });
      }

      const totalCommentsCount = await prisma.comment.count({
        where: { projectId: input.projectId },
      });

      return { comments, usersComments, totalCommentsCount };
    }),

  onProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await prisma?.comment.create({
          data: {
            body: input.comment,
            user: { connect: { id: ctx.session.user.id } },
            project: { connect: { id: input.projectId } },
          },
        });
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
