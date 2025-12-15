"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Package,
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Eye,
} from "lucide-react";

interface Document {
  id: string;
  type: string;
  url: string;
  status: string;
  uploadedAt: string;
  driver: {
    id: string;
    user: {
      name: string;
      email: string;
      phone?: string;
    };
  };
}

export default function AdminDocumentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchDocuments();
      }
    }
  }, [status, session, statusFilter]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/admin/documents?status=${statusFilter}`);
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (documentId: string, action: "approve" | "reject") => {
    if (action === "reject" && !rejectReason) {
      alert("Veuillez indiquer une raison de rejet");
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch("/api/admin/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          action,
          ...(action === "reject" && { reason: rejectReason }),
        }),
      });

      if (response.ok) {
        setSelectedDoc(null);
        setRejectReason("");
        await fetchDocuments();
        alert(`Document ${action === "approve" ? "approuvé" : "rejeté"} avec succès`);
      } else {
        const data = await response.json();
        alert(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      alert("Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ID_CARD: "Carte d'identité",
      DRIVER_LICENSE: "Permis de conduire",
      VEHICLE_REGISTRATION: "Carte grise",
      INSURANCE: "Assurance",
      BUSINESS_LICENSE: "Licence professionnelle",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      APPROVED: { label: "Approuvé", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      REJECTED: { label: "Rejeté", color: "bg-red-100 text-red-800", icon: XCircle },
    };
    return badges[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: FileText };
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GetMyChoose Admin</span>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vérification des Documents</h1>
          <p className="text-muted-foreground">
            Validez ou rejetez les documents uploadés par les livreurs
          </p>
        </div>

        {/* Status Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrer par statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {["PENDING", "APPROVED", "REJECTED"].map((status) => {
                const badge = getStatusBadge(status);
                const Icon = badge.icon;
                const count = documents.filter((d) => d.status === status).length;

                return (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    onClick={() => setStatusFilter(status)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {badge.label}
                    {status === statusFilter && count > 0 && (
                      <span className="ml-2 bg-primary-foreground text-primary px-2 py-0.5 rounded-full text-xs">
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {documents.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Aucun document {getStatusBadge(statusFilter).label.toLowerCase()}
                </h3>
                <p className="text-muted-foreground">
                  Essayez de changer le filtre pour voir d&apos;autres documents
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => {
              const badge = getStatusBadge(doc.status);
              const Icon = badge.icon;

              return (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {getDocTypeLabel(doc.type)}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${badge.color}`}>
                              <Icon className="h-3 w-3" />
                              {badge.label}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc.driver.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{doc.driver.user.email}</span>
                            </div>
                            {doc.driver.user.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{doc.driver.user.phone}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Uploadé le {new Date(doc.uploadedAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir Document
                          </Button>
                        </a>

                        {doc.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(doc.id, "approve")}
                              disabled={actionLoading}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedDoc(doc)}
                              disabled={actionLoading}
                              className="w-full"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Reject Modal */}
                    {selectedDoc?.id === doc.id && (
                      <div className="mt-4 p-4 border rounded-lg bg-red-50">
                        <h4 className="font-semibold mb-2">Raison du rejet</h4>
                        <textarea
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm mb-3"
                          placeholder="Expliquez pourquoi ce document est rejeté..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDoc(null);
                              setRejectReason("");
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(doc.id, "reject")}
                            disabled={actionLoading || !rejectReason}
                          >
                            Confirmer le rejet
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
