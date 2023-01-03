import { bucket } from "./../../../utils/backblaze";
import { uploadImg } from "./../../../utils/upload-img";
import { sortSearchTerm } from "./../../common/sort-search-term";
import { computeAverageRating } from "./../../common/compute-average-rating";
import { TRPCError } from "@trpc/server";
import { ownerProtectedProcedure, publicProcedure } from "./../trpc";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@/src/server/db/client";

export const projectRouter = router({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        source_code_url: z.string().url(),
        live_demo_url: z.string().optional(),

        hashtags: z.array(z.string()).optional(),
        image: z
          .object({
            base64: z.string(),
            ext: z.string(),
          })
          .optional(),

        inspiredById: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let image = null;
      const { name, description, source_code_url, live_demo_url } = input;

      if (input.image) {
        await bucket.init();

        image = await uploadImg(input.image.base64, input.image.ext);
      }

      const project = await prisma?.project.create({
        data: {
          name,
          description,
          source_code_url,
          live_demo_url,

          inspired: {
            connect: input.inspiredById
              ? { id: input.inspiredById }
              : undefined,
          },

          image,

          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },

          hashtags: {
            connectOrCreate: input.hashtags?.map((h) => {
              return {
                where: { name: h },
                create: { name: h },
              };
            }),
          },
        },
      });

      return project;
    }),

  rate: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        rating: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const alreadyRated = await prisma?.rating?.findFirst({
        where: { projectId: input.projectId, userId: ctx.session.user.id },
      });

      if (alreadyRated && alreadyRated.value === input.rating) {
        return alreadyRated;
      }

      if (alreadyRated) {
        const updatedRating = await prisma?.rating.update({
          where: { id: alreadyRated.id },
          data: {
            value: input.rating,
          },
        });

        const average_rating = await computeAverageRating(input.projectId);

        await prisma?.project.update({
          where: { id: input.projectId },
          data: { average_rating },
        });

        return updatedRating;
      }

      const rating = await prisma?.rating.create({
        data: {
          project: {
            connect: { id: input.projectId },
          },
          userId: ctx.session.user.id,
          value: input.rating,
        },
      });

      const average_rating = await computeAverageRating(input.projectId);

      await prisma?.project.update({
        where: { id: input.projectId },
        data: { average_rating },
      });

      return rating;
    }),

  getProjectById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const project = await prisma?.project.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: {
            select: {
              name: true,
              id: true,
              image: true,
            },
          },

          inspired: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          message: `No such project with id ${input.id}`,
          code: "BAD_REQUEST",
        });
      }

      let userRate = null;

      if (ctx.session?.user) {
        const rated = await prisma?.rating.findFirst({
          where: { userId: ctx.session.user.id, projectId: input.id },
        });
        userRate = rated ? rated.value : null;
      }

      const totalRatingCount = await prisma?.rating.count({
        where: { projectId: input.id },
      });

      return {
        ...project,
        userRate,
        totalRatingCount,
      };
    }),

  getAll: publicProcedure
    .input(
      z
        .object({
          // Sorting query
          sort: z
            .object({
              by: z.enum(["rating", "newest", "discussed"]),
              order: z.enum(["asc", "desc"]),
            })
            .optional(),

          // Searching query
          searchTerm: z.string().optional(),

          // Pagination query
          take: z.number().min(1).max(100).nullish(),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      // Pagination
      const take = input?.take ?? 7;
      const cursor = input?.cursor ? { id: input.cursor } : undefined;

      // Sorting
      let sortQuery = {};
      const order = input?.sort?.order || "asc";

      if (input?.sort?.by) {
        switch (input.sort.by) {
          case "discussed":
            sortQuery = { comments: { _count: order } };
            break;

          case "newest":
            sortQuery = { createdAt: order };
            break;

          case "rating":
            sortQuery = { average_rating: order };
            break;

          default:
            break;
        }
      }

      // Search
      const { hashtags, searchText } = sortSearchTerm(input?.searchTerm || "");

      const projects =
        (await prisma?.project.findMany({
          // --- Pagination ---
          take,
          cursor,
          skip: input?.cursor ? 1 : 0,
          // --- Pagination ---

          // --- Sorting ---
          orderBy: sortQuery,

          where:
            searchText || hashtags.length
              ? {
                  name: { contains: searchText, mode: "insensitive" },

                  AND: hashtags.length
                    ? {
                        hashtags: {
                          some: { name: { in: hashtags } },
                        },
                      }
                    : {},
                }
              : {},
          // --- Sorting ---

          // --- Selection ---
          select: {
            id: true,
            image: true,
            name: true,
            user: {
              select: {
                name: true,
              },
            },

            hashtags: { select: { name: true, id: true } },
          },
          // --- Selection ---
        })) || [];

      const nextCursor =
        projects.length < take ? undefined : projects[take - 1]?.id;

      return { projects, nextCursor };
    }),

  searchOptions: publicProcedure
    .input(
      z.object({
        take: z.number().default(5),
        term: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { hashtags, searchText } = sortSearchTerm(input.term);

      const projects = await prisma?.project.findMany({
        take: input.take,

        where: {
          name: {
            contains: searchText,
            mode: "insensitive",
          },

          AND: hashtags.length
            ? {
                hashtags: {
                  some: { name: { in: hashtags } },
                },
              }
            : {},
        },

        select: {
          name: true,
          live_demo_url: true,
          id: true,

          user: {
            select: { name: true },
          },

          hashtags: { select: { name: true } },
        },
      });

      return projects;
    }),

  deleteById: ownerProtectedProcedure.mutation(async ({ input }) => {
    await prisma?.project.delete({ where: { id: input.projectId } });
    return "deleted";
  }),
});
