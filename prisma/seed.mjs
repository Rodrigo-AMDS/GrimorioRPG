import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const username = process.env.INITIAL_GM_USERNAME;
const password = process.env.INITIAL_GM_PASSWORD;
const testUsername = process.env.TEST_USERNAME;
const testPassword = process.env.TEST_PASSWORD;

if (!username || !password) {
  throw new Error("Defina INITIAL_GM_USERNAME e INITIAL_GM_PASSWORD antes de executar o seed.");
}

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash, status: "ACTIVE" },
    update: { passwordHash, status: "ACTIVE" }
  });
  if (testUsername && testPassword) {
    const testPasswordHash = await bcrypt.hash(testPassword, 12);
    await prisma.user.upsert({
      where: { username: testUsername },
      create: { username: testUsername, passwordHash: testPasswordHash, status: "ACTIVE" },
      update: { passwordHash: testPasswordHash, status: "ACTIVE" }
    });
  }
  console.log("Mestre inicial preparado.");
} finally {
  await prisma.$disconnect();
}
