import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./../trpc";

export const featuresRouter = router({
  addTo: protectedProcedure
    .input(
      z.object({
        inspirationId: z.string(),
        title: z.string().max(20),
        body: z.string().max(160),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma?.feature.create({
        data: {
          name: input.title,
          shortDescription: input.body,

          user: {
            connect: { id: ctx.session.user.id },
          },

          inspiration: {
            connect: { id: input.inspirationId },
          },
        },
      });
      return "added!";
    }),

  getAll: publicProcedure
    .input(
      z.object({
        inspirationId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await prisma?.feature.findMany({
        where: { inspirationId: input.inspirationId },

        select: {
          id: true,
          name: true,
        },
      });
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await prisma?.feature.findUnique({
        where: { id: input.id },
        include: { user: { select: { name: true, image: true, id: true } } },
      });
    }),
});
