"use client";

import { useEffect, useState } from "react";
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
  Euro,
  TruckIcon,
  User,
  Phone,
  Navigation,
} from "lucide-react";
import { formatCurrency, formatDistance, estimateDeliveryTime } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupName?: string;
  pickupPhone?: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  deliveryName: string;
  deliveryPhone: string;
  packageType: string;
  packageDescription?: string;
  distance: number;
  totalPrice: number;
  driverEarnings?: number;
  createdAt: string;
  customer: {
    name: string;
    avatar?: string;
  };
}

export default function AvailableOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "DRIVER") {
        router.push("/dashboard");
      } else {
        fetchAvailableOrders();
      }
    }
  }, [status, session, router]);

  const fetchAvailableOrders = async () => {
    try {
      const response = await fetch("/api/orders/available");
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      if (response.ok) {
        // Redirect to order details
        router.push(`/orders/${orderId}`);
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'acceptation de la commande");
      }
    } catch (error) {
      console.error("Failed to accept order:", error);
      alert("Erreur lors de l'acceptation de la commande");
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const getPackageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SMALL: "Petit",
      MEDIUM: "Moyen",
      LARGE: "Grand",
      EXTRA_LARGE: "Extra Large",
    };
    return labels[type] || type;
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
              Tableau de bord
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TruckIcon className="h-8 w-8 text-primary" />
            Courses disponibles
          </h1>
          <p className="text-muted-foreground">
            Sélectionnez les courses qui correspondent à votre itinéraire
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune course disponible</h3>
                <p className="text-muted-foreground mb-6">
                  Il n'y a pas de courses disponibles pour le moment. Revenez plus tard !
                </p>
                <Link href="/dashboard">
                  <Button>Retour au tableau de bord</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              const deliveryTime = estimateDeliveryTime(order.distance);

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          {order.orderNumber}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {getPackageTypeLabel(order.packageType)} • {formatDistance(order.distance)} •
                          ~{deliveryTime} min
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(order.driverEarnings || order.totalPrice * 0.85)}
                        </div>
                        <p className="text-sm text-muted-foreground">Vos gains</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Client: {order.customer.name}</span>
                    </div>

                    {/* Pickup Address */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Retrait</p>
                          <p className="text-sm text-muted-foreground">{order.pickupAddress}</p>
                          {order.pickupName && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="h-3 w-3" />
                              {order.pickupName}
                              {order.pickupPhone && ` • ${order.pickupPhone}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Livraison</p>
                          <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            {order.deliveryName}
                            {order.deliveryPhone && (
                              <>
                                {" • "}
                                <Phone className="h-3 w-3" />
                                {order.deliveryPhone}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Package Description */}
                    {order.packageDescription && (
                      <div className="text-sm bg-muted p-3 rounded-md">
                        <p className="font-semibold mb-1">Description du colis:</p>
                        <p className="text-muted-foreground">{order.packageDescription}</p>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Il y a {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        <span>Total: {formatCurrency(order.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/orders/${order.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Navigation className="mr-2 h-4 w-4" />
                          Voir détails
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={acceptingOrderId === order.id}
                        className="flex-1"
                      >
                        {acceptingOrderId === order.id ? "Acceptation..." : "Accepter la course"}
                      </Button>
                    </div>
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
