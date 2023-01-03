import { env } from "@/src/env/server.mjs";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({ log: ["info"] });
if (env.NODE_ENV !== "production") global.prisma = prisma;

export { prisma };
