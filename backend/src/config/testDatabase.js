import prisma from "./database.js";

const testDatabase = async () => {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL connected successfully");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ PostgreSQL connection failed");
    console.error(error.message);

    process.exit(1);
  }
};

testDatabase();