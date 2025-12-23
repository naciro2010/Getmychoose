"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  TruckIcon,
  QrCode,
  Star,
  MessageCircle,
  Navigation,
} from "lucide-react";
import { formatCurrency, formatDistance } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryName: string;
  deliveryPhone: string;
  packageType: string;
  packageDescription?: string;
  distance: number;
  totalPrice: number;
  driverEarnings?: number;
  qrCode?: string;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  driver?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  rating?: {
    rating: number;
    comment?: string;
  };
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchOrder();
    }
  }, [status]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        alert(data.error || "Commande non trouvée");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchOrder(); // Refresh order data
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Action failed:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: "En attente d'un livreur", color: "text-yellow-600", icon: Clock },
      ACCEPTED: { label: "Livreur en route vers le retrait", color: "text-blue-600", icon: TruckIcon },
      PICKED_UP: { label: "Colis récupéré, en transit", color: "text-blue-600", icon: Package },
      IN_TRANSIT: { label: "En cours de livraison", color: "text-blue-600", icon: TruckIcon },
      DELIVERED: { label: "Livré avec succès", color: "text-green-600", icon: CheckCircle2 },
      CANCELLED: { label: "Annulée", color: "text-red-600", icon: Clock },
    };
    return statusMap[status] || { label: status, color: "text-gray-600", icon: Clock };
  };

  const isDriver = session?.user?.role === "DRIVER" && order?.driver?.id === session?.user?.id;
  const isCustomer = order?.customer?.id === session?.user?.id;

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

  if (!order) {
    return null;
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GetMyChoose</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <div className="container max-w-4xl py-8">
        {/* Order Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{order.orderNumber}</h1>
              <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon className="h-5 w-5" />
                <span className="font-semibold">{statusInfo.label}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {isDriver ? "Vos gains" : "Montant total"}
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(isDriver ? (order.driverEarnings || 0) : order.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progression de la livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${order.createdAt ? "opacity-100" : "opacity-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${order.createdAt ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Commande créée</p>
                  {order.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-3 ${order.acceptedAt ? "opacity-100" : "opacity-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${order.acceptedAt ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                  <TruckIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Acceptée par un livreur</p>
                  {order.acceptedAt && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.acceptedAt).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-3 ${order.pickedUpAt ? "opacity-100" : "opacity-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${order.pickedUpAt ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Colis récupéré</p>
                  {order.pickedUpAt && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.pickedUpAt).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-3 ${order.deliveredAt ? "opacity-100" : "opacity-50"}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${order.deliveredAt ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Livré</p>
                  {order.deliveredAt && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.deliveredAt).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Détails de la livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Addresses */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-semibold">Point de retrait</p>
                  <p className="text-muted-foreground">{order.pickupAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="font-semibold">Point de livraison</p>
                  <p className="text-muted-foreground">{order.deliveryAddress}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <User className="h-4 w-4" />
                    <span>{order.deliveryName}</span>
                    {order.deliveryPhone && (
                      <>
                        <span>•</span>
                        <Phone className="h-4 w-4" />
                        <span>{order.deliveryPhone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Info */}
            <div className="border-t pt-4">
              <p className="font-semibold mb-2">Informations du colis</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{order.packageType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-medium">{formatDistance(order.distance)}</p>
                </div>
              </div>
              {order.packageDescription && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm">{order.packageDescription}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Customer Info */}
          {order.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{order.customer.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{order.customer.email}</span>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
                {isDriver && (
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contacter
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Driver Info */}
          {order.driver && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  Livreur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{order.driver.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{order.driver.email}</span>
                </div>
                {order.driver.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{order.driver.phone}</span>
                  </div>
                )}
                {isCustomer && (
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contacter
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Driver Actions */}
        {isDriver && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === "ACCEPTED" && (
                <Button
                  onClick={() => handleAction("pickup")}
                  disabled={actionLoading}
                  className="w-full"
                  size="lg"
                >
                  <Package className="mr-2 h-5 w-5" />
                  Confirmer la récupération du colis
                </Button>
              )}

              {order.status === "PICKED_UP" && (
                <Button
                  onClick={() => handleAction("deliver")}
                  disabled={actionLoading}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Confirmer la livraison
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <Navigation className="mr-2 h-4 w-4" />
                Ouvrir dans Maps
              </Button>

              {order.qrCode && (
                <Button variant="outline" className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Afficher le QR Code
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rating */}
        {order.status === "DELIVERED" && !order.rating && (
          <Card>
            <CardHeader>
              <CardTitle>Évaluer {isDriver ? "le client" : "le livreur"}</CardTitle>
              <CardDescription>
                Votre avis aide à améliorer la qualité du service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/orders/${order.id}/rate`}>
                <Button className="w-full">
                  <Star className="mr-2 h-4 w-4" />
                  Laisser un avis
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Existing Rating */}
        {order.rating && (
          <Card>
            <CardHeader>
              <CardTitle>Évaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < order.rating!.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                  />
                ))}
                <span className="font-semibold ml-2">{order.rating.rating}/5</span>
              </div>
              {order.rating.comment && (
                <p className="text-muted-foreground">{order.rating.comment}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
