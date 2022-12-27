import { sortSearchTerm } from "./../../common/sort-search-term";
import { computeAverageRating } from "./../../common/compute-average-rating";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "./../trpc";
import { constructNativeImgUrl } from "./../../../utils/construct-native-img-url";
import { takeScreenshotUrl } from "./../../../utils/take-screenshot-url";
import { bucket } from "./../../../utils/backblaze";
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      let image = null;

      if (input?.live_demo_url?.length) {
        await bucket.init();
        const screenshot = await takeScreenshotUrl(input.live_demo_url);
        const fileId = await bucket.uploadImage({
          imageBuffer:
            typeof screenshot === "string"
              ? Buffer.from(screenshot, "base64")
              : screenshot,
          fileType: "webp",
        });

        image = constructNativeImgUrl(fileId);
      }

      const populate = { ...input, hashtags: undefined };

      const project = await prisma?.project.create({
        data: {
          ...populate,

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
      const alreadyRated = await prisma?.rating.findFirst({
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

      return {
        ...project,
        userRate,
      };
    }),

  getAll: publicProcedure
    .input(
      z
        .object({
          sort: z
            .object({
              by: z.enum(["rating", "newest", "discussed"]),
              order: z.enum(["asc", "desc"]),
            })
            .optional(),

          searchTerm: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
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

      return await prisma?.project.findMany({
        include: {
          user: {
            select: {
              name: true,
            },
          },

          hashtags: { select: { name: true, id: true } },
        },

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
      });
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
});
