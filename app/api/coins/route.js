// app/api/coins/route.js
import { getServerSession } from "next-auth"; // Untuk mendapatkan sesi pengguna di sisi server
import { NextResponse } from "next/server"; // Untuk membuat respons API
import prisma from "@/lib/prisma"; // Mengimpor Prisma Client yang sudah kita buat utilitasnya

// Konstanta untuk jumlah koin awal dan interval reset
const GUEST_INITIAL_COINS = 10;
const LOGGED_IN_INITIAL_COINS = 1000;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

// Handler untuk permintaan GET (mendapatkan saldo koin)
export async function GET(request) {
  const session = await getServerSession(); // Mendapatkan sesi pengguna saat ini

  let userId;
  let isGuest = false;

  // Logika untuk menentukan ID pengguna (login atau tamu)
  if (!session || !session.user || !session.user.id) {
    // Jika tidak ada sesi login, anggap sebagai tamu.
    // Kita menggunakan IP sebagai ID tamu sementara.
    // CATATAN PENTING: Menggunakan IP untuk ID tamu memiliki batasan (IP bisa berubah, banyak user bisa berbagi IP).
    // Untuk implementasi tamu yang lebih robust, Anda harus menggunakan ID unik yang disimpan di cookie/localStorage.
    userId = "guest_" + (request.headers.get('x-forwarded-for') || request.ip);
    if (userId === "guest_null" || userId === "guest_undefined" || userId === "guest_::1") { // Fallback jika IP tidak tersedia atau localhost
      userId = "guest_" + Date.now(); // Gunakan timestamp sebagai ID tamu fallback
    }
    isGuest = true;
  } else {
    // Jika ada sesi login, gunakan ID pengguna dari sesi
    userId = session.user.id;
  }

  try {
    // Cari saldo koin pengguna di database
    let coinBalance = await prisma.coinBalance.findUnique({
      where: { userId: userId },
    });

    const now = new Date();

    // Logika Reset Koin 24 Jam
    if (coinBalance) {
      const lastResetTime = coinBalance.lastReset;

      // Jika sudah ada data koin dan sudah lebih dari 24 jam sejak reset terakhir
      if (lastResetTime && (now.getTime() - lastResetTime.getTime()) >= RESET_INTERVAL_MS) {
        // Update saldo koin dan waktu reset
        coinBalance = await prisma.coinBalance.update({
          where: { userId: userId },
          data: {
            balance: isGuest ? GUEST_INITIAL_COINS : LOGGED_IN_INITIAL_COINS, // Berikan koin sesuai status (tamu/login)
            lastReset: now, // Perbarui waktu reset
          },
        });
      }
    } else {
      // Jika belum ada entri koin untuk pengguna ini, buat yang baru
      coinBalance = await prisma.coinBalance.create({
        data: {
          userId: userId,
          balance: isGuest ? GUEST_INITIAL_COINS : LOGGED_IN_INITIAL_COINS,
          lastReset: now,
          isGuest: isGuest,
        },
      });
    }

    // Kembalikan saldo koin sebagai respons JSON
    return NextResponse.json({ balance: coinBalance.balance });

  } catch (error) {
    console.error("Error fetching or resetting coin balance:", error);
    return NextResponse.json({ error: "Failed to get coin balance" }, { status: 500 });
  }
}

// Handler untuk permintaan POST (mengurangi saldo koin)
export async function POST(request) {
  const session = await getServerSession(); // Dapatkan sesi pengguna
  const { amount = 1 } = await request.json(); // Ambil jumlah koin yang akan dikurangi (default 1)

  let userId;
  if (!session || !session.user || !session.user.id) {
    // Logika ID tamu yang sama seperti di GET
    userId = "guest_" + (request.headers.get('x-forwarded-for') || request.ip);
    if (userId === "guest_null" || userId === "guest_undefined" || userId === "guest_::1") {
      userId = "guest_" + Date.now();
    }
  } else {
    userId = session.user.id;
  }

  try {
    // Cari saldo koin pengguna
    const coinBalance = await prisma.coinBalance.findUnique({
      where: { userId: userId },
    });

    // Periksa apakah koin cukup
    if (!coinBalance || coinBalance.balance < amount) {
      return NextResponse.json({ error: "Koin tidak cukup!" }, { status: 400 });
    }

    // Kurangi saldo koin di database
    const updatedBalance = await prisma.coinBalance.update({
      where: { userId: userId },
      data: {
        balance: coinBalance.balance - amount,
      },
    });

    // Kembalikan saldo koin yang baru
    return NextResponse.json({ balance: updatedBalance.balance });

  } catch (error) {
    console.error("Error deducting coins:", error);
    return NextResponse.json({ error: "Gagal mengurangi koin" }, { status: 500 });
  }
}