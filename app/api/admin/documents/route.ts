import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const documents = await prisma.document.findMany({
      where: { status: status as any },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Admin documents fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { documentId, action, reason } = body;

    const updateData: any = {};

    if (action === "approve") {
      updateData.status = "APPROVED";
      updateData.verifiedAt = new Date();
    } else if (action === "reject") {
      updateData.status = "REJECTED";
      updateData.rejectionReason = reason || "Document non conforme";
    } else {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });

    // Check if all required documents are approved
    if (action === "approve") {
      const allDocuments = await prisma.document.findMany({
        where: { driverId: document.driverId },
      });

      const requiredTypes = ["ID_CARD", "DRIVER_LICENSE", "VEHICLE_REGISTRATION", "INSURANCE"];
      const allApproved = requiredTypes.every((type) =>
        allDocuments.some((doc) => doc.type === type && doc.status === "APPROVED")
      );

      if (allApproved) {
        await prisma.driver.update({
          where: { id: document.driverId },
          data: { isVerified: true },
        });
      }
    }

    return NextResponse.json({
      message: `Document ${action === "approve" ? "approuvé" : "rejeté"} avec succès`,
      document,
    });
  } catch (error) {
    console.error("Admin document update error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
