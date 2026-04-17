import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "./env";
import { PrismaClient } from "@/generated/prisma/client";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;