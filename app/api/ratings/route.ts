import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        rating: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // Check if order is delivered
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "La commande doit être livrée pour être évaluée" },
        { status: 400 }
      );
    }

    // Check if already rated
    if (order.rating) {
      return NextResponse.json(
        { error: "Cette commande a déjà été évaluée" },
        { status: 400 }
      );
    }

    // Check if user is customer or driver of this order
    const isCustomer = order.customerId === session.user.id;
    const isDriver = order.driverId === session.user.id;

    if (!isCustomer && !isDriver) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à évaluer cette commande" },
        { status: 403 }
      );
    }

    // Determine who is rating whom
    const fromUserId = session.user.id;
    const toUserId = isCustomer ? order.driverId : order.customerId;

    if (!toUserId) {
      return NextResponse.json(
        { error: "Destinataire de l'évaluation non trouvé" },
        { status: 400 }
      );
    }

    // Create rating
    const newRating = await prisma.rating.create({
      data: {
        orderId,
        fromUserId,
        toUserId,
        rating,
        comment: comment || null,
      },
    });

    // Update driver's average rating if rating a driver
    if (isCustomer && order.driverId) {
      const driverRatings = await prisma.rating.findMany({
        where: { toUserId: order.driverId },
      });

      const avgRating =
        driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length;

      await prisma.driver.update({
        where: { userId: order.driverId },
        data: { averageRating: avgRating },
      });
    }

    return NextResponse.json(
      { message: "Évaluation enregistrée avec succès", rating: newRating },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rating creation error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
