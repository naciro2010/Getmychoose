"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft, Upload, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";

interface Document {
  id: string;
  type: string;
  url: string;
  status: string;
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export default function DriverDocumentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "DRIVER") {
        router.push("/dashboard");
      } else {
        fetchDocuments();
      }
    }
  }, [status, session]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/driver/documents");
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type: string, file: File) => {
    setUploading(true);

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For MVP, we'll simulate the upload

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/driver/documents", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchDocuments();
        alert("Document téléchargé avec succès");
      } else {
        alert("Erreur lors du téléchargement");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = [
    { type: "ID_CARD", label: "Carte d'identité", required: true },
    { type: "DRIVER_LICENSE", label: "Permis de conduire", required: true },
    { type: "VEHICLE_REGISTRATION", label: "Carte grise du véhicule", required: true },
    { type: "INSURANCE", label: "Assurance", required: true },
    { type: "BUSINESS_LICENSE", label: "Licence professionnelle (optionnel)", required: false },
  ];

  const getDocumentStatus = (type: string) => {
    const doc = documents.find((d) => d.type === type);
    if (!doc) return null;
    return doc;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      APPROVED: "Approuvé",
      REJECTED: "Rejeté",
      PENDING: "En attente",
    };
    return labels[status] || status;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const approvedCount = documents.filter((d) => d.status === "APPROVED").length;
  const requiredCount = documentTypes.filter((d) => d.required).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GetMyChoose</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
        </div>
      </header>

      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes documents</h1>
          <p className="text-muted-foreground">
            Téléchargez vos documents pour être vérifié et commencer à livrer
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progression de la vérification</CardTitle>
            <CardDescription>
              {approvedCount} sur {requiredCount} documents requis approuvés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${(approvedCount / requiredCount) * 100}%` }}
              />
            </div>
            {approvedCount === requiredCount && (
              <p className="text-green-600 font-semibold mt-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Votre compte est vérifié ! Vous pouvez commencer à livrer.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {documentTypes.map((docType) => {
            const existingDoc = getDocumentStatus(docType.type);

            return (
              <Card key={docType.type}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {docType.label}
                        {docType.required && (
                          <span className="text-sm font-normal text-red-500">*</span>
                        )}
                      </CardTitle>
                      {existingDoc && (
                        <CardDescription className="flex items-center gap-2 mt-2">
                          {getStatusIcon(existingDoc.status)}
                          <span>{getStatusLabel(existingDoc.status)}</span>
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!existingDoc ? (
                    <div>
                      <Label
                        htmlFor={`upload-${docType.type}`}
                        className="cursor-pointer"
                      >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium mb-1">
                            Cliquez pour télécharger
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG, PNG (max 5MB)
                          </p>
                        </div>
                        <input
                          id={`upload-${docType.type}`}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(docType.type, file);
                            }
                          }}
                          disabled={uploading}
                        />
                      </Label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <div>
                            <p className="text-sm font-medium">Document téléchargé</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(existingDoc.uploadedAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <a
                          href={existingDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            Voir
                          </Button>
                        </a>
                      </div>

                      {existingDoc.status === "REJECTED" && existingDoc.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm font-semibold text-red-800 mb-1">
                            Raison du rejet:
                          </p>
                          <p className="text-sm text-red-700">{existingDoc.rejectionReason}</p>
                        </div>
                      )}

                      {existingDoc.status === "APPROVED" && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            ✓ Document vérifié le{" "}
                            {existingDoc.verifiedAt &&
                              new Date(existingDoc.verifiedAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      )}

                      {existingDoc.status === "PENDING" && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            ⏳ Document en cours de vérification
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Besoin d&apos;aide ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Tous les documents doivent être lisibles et non expirés</p>
            <p>• La vérification prend généralement 24-48 heures</p>
            <p>• En cas de rejet, vous pouvez télécharger un nouveau document</p>
            <p>• Contactez le support si vous avez des questions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
