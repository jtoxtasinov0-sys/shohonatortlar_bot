/**
 * PostgreSQL (Neon) ulanishi — Prisma Client.
 */
const { PrismaClient } = require('@prisma/client');
const config = require('../config/default');

const prisma = new PrismaClient({
  log: config.env === 'development' ? ['warn', 'error'] : ['error'],
});

async function connectDatabase() {
  if (!config.isDatabaseConfigured) {
    throw new Error(
      "DATABASE_URL topilmadi yoki noto'g'ri. backend/.env faylida Neon connection string'ni yozing."
    );
  }
  await prisma.$connect();
  console.log('🗄️  PostgreSQL (Neon) ulandi');
}

async function disconnectDatabase() {
  await prisma.$disconnect();
}

module.exports = { prisma, connectDatabase, disconnectDatabase };
