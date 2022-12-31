import { protectedProcedure, publicProcedure, router } from "./../trpc";
import { prisma } from "@/src/server/db/client";
import { z } from "zod";

export const inspirationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.inspiration.create({
        data: {
          name: input.name,
          description: input.description,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: publicProcedure.query(async () => {
    return await prisma.inspiration.findMany({
      select: {
        user: {
          select: { name: true },
        },

        name: true,
        id: true,

        implemented: { select: { _count: true } },

        createdAt: true,
      },
    });
  }),

  getByIdShort: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.inspiration.findUnique({
        where: { id: input.id },
        select: { id: true, name: true },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.inspiration.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          implemented: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              user: { select: { name: true } },
            },
          },
        },
      });
    }),
});
