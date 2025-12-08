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

    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
      include: {
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Profil livreur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ documents: driver.documents });
  } catch (error) {
    console.error("Documents fetch error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Profil livreur non trouvé" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: "Fichier et type requis" },
        { status: 400 }
      );
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For MVP, we'll create a mock URL
    const mockUrl = `https://storage.getmychoose.com/documents/${session.user.id}/${type}-${Date.now()}.pdf`;

    // Create document record
    const document = await prisma.document.create({
      data: {
        driverId: driver.id,
        type: type as any,
        url: mockUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "Document téléchargé avec succès", document },
      { status: 201 }
    );
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
