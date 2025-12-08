import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Profil livreur non trouvé" },
        { status: 404 }
      );
    }

    // Get available orders (PENDING status, no driver assigned)
    // In production, this would filter by distance from driver's location
    const availableOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        driverId: null,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit to 20 most recent
    });

    return NextResponse.json({ orders: availableOrders });
  } catch (error) {
    console.error("Available orders fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
