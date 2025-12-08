import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        payment: true,
        rating: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...data } = body;

    let updateData: any = {};

    switch (action) {
      case "accept":
        // Check if user is a driver
        const driver = await prisma.driver.findUnique({
          where: { userId: session.user.id },
        });

        if (!driver) {
          return NextResponse.json(
            { error: "Profil livreur non trouvé" },
            { status: 404 }
          );
        }

        updateData = {
          driverId: session.user.id,
          status: "ACCEPTED",
          acceptedAt: new Date(),
        };
        break;

      case "pickup":
        updateData = {
          status: "PICKED_UP",
          pickedUpAt: new Date(),
        };
        break;

      case "deliver":
        updateData = {
          status: "DELIVERED",
          deliveredAt: new Date(),
        };
        break;

      case "cancel":
        updateData = {
          status: "CANCELLED",
          cancellationReason: data.reason || "Annulée",
        };
        break;

      default:
        return NextResponse.json(
          { error: "Action invalide" },
          { status: 400 }
        );
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If delivered, update driver stats
    if (action === "deliver") {
      await prisma.driver.update({
        where: { userId: session.user.id },
        data: {
          totalDeliveries: { increment: 1 },
          earnings: { increment: order.driverEarnings || 0 },
        },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalPrice,
          status: "COMPLETED",
        },
      });
    }

    return NextResponse.json({
      message: "Commande mise à jour avec succès",
      order,
    });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
