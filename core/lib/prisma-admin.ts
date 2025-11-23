import { PrismaClient } from "@prisma/client";

const prismaAdmin = new PrismaClient({
  datasources: {
    db: {
      url: process.env.ADMIN_DATABASE_URL,
    },
  },
});

export { prismaAdmin };
