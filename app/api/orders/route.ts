import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, generateQRCodeData } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: session.user.id,

        // Package
        packageType: body.packageType,
        packageWeight: body.packageWeight ? parseFloat(body.packageWeight) : null,
        packageDescription: body.packageDescription,
        prohibitedItems: body.prohibitedItems,

        // Pickup
        pickupAddress: body.pickupAddress,
        pickupLat: body.pickupLat,
        pickupLng: body.pickupLng,
        pickupName: body.pickupName,
        pickupPhone: body.pickupPhone,

        // Delivery
        deliveryAddress: body.deliveryAddress,
        deliveryLat: body.deliveryLat,
        deliveryLng: body.deliveryLng,
        deliveryName: body.deliveryName,
        deliveryPhone: body.deliveryPhone,

        // Pricing
        distance: body.distance,
        basePrice: body.basePrice,
        urgencyFee: body.urgencyFee,
        totalPrice: body.totalPrice,
        driverEarnings: body.driverEarnings,
        commission: body.commission,

        // Timing
        isScheduled: body.isScheduled || false,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,

        // QR Code
        qrCode: generateQRCodeData("temp"),

        status: "PENDING",
      },
    });

    // Update QR code with actual order ID
    await prisma.order.update({
      where: { id: order.id },
      data: { qrCode: generateQRCodeData(order.id) },
    });

    return NextResponse.json(
      { message: "Commande créée avec succès", orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la commande" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: session.user.id },
          { driverId: session.user.id },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
