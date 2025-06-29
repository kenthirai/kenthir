// lib/prisma.js
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  // Di produksi, selalu buat instans baru
  prisma = new PrismaClient();
} else {
  // Di pengembangan, gunakan instans global untuk mencegah instansiasi berulang
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;