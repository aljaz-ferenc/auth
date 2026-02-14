import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../../prisma/generated/prisma/index.js";

const connectionString = `${process.env.DATABASE_URL}`;

if (!connectionString) throw new Error("Missing DATABASE_URL in .env");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
