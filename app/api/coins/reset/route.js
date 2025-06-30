import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_COIN_RESET_PASSWORD;

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reset semua saldo koin ke default (bisa disesuaikan sesuai kebutuhan)
  const GUEST_INITIAL_COINS = 10;
  const LOGGED_IN_INITIAL_COINS = 1000;

  // Reset untuk semua user dan guest
  await prisma.coinBalance.updateMany({
    where: { isGuest: true },
    data: { balance: GUEST_INITIAL_COINS, lastReset: new Date() },
  });
  await prisma.coinBalance.updateMany({
    where: { isGuest: false },
    data: { balance: LOGGED_IN_INITIAL_COINS, lastReset: new Date() },
  });

  return NextResponse.json({ success: true });
}
