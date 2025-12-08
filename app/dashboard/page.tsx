"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Plus,
  TruckIcon,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  User,
  Euro,
  Star,
  MapPin
} from "lucide-react";
import { formatCurrency, formatDistance } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  totalPrice: number;
  distance: number;
  driverEarnings?: number;
  createdAt: string;
  customer?: {
    name: string;
  };
  driver?: {
    name: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    earnings: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);

        // Calculate stats
        const stats = {
          total: data.orders.length,
          pending: data.orders.filter((o: Order) => o.status === "PENDING" || o.status === "ACCEPTED").length,
          completed: data.orders.filter((o: Order) => o.status === "DELIVERED").length,
          earnings: data.orders
            .filter((o: Order) => o.status === "DELIVERED" && o.driverEarnings)
            .reduce((sum: number, o: Order) => sum + (o.driverEarnings || 0), 0),
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
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

  const isDriver = session?.user?.role === "DRIVER";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ACCEPTED":
      case "PICKED_UP":
      case "IN_TRANSIT":
        return <TruckIcon className="h-4 w-4 text-blue-500" />;
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "CANCELLED":
      case "REFUNDED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "En attente",
      ACCEPTED: "Acceptée",
      PICKED_UP: "Récupérée",
      IN_TRANSIT: "En transit",
      DELIVERED: "Livrée",
      CANCELLED: "Annulée",
      REFUNDED: "Remboursée",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GetMyChoose</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name || session?.user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour {session?.user?.name || ""}
          </h1>
          <p className="text-muted-foreground">
            {isDriver
              ? "Gérez vos livraisons et suivez vos gains"
              : "Gérez vos commandes et suivez vos livraisons"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          {isDriver ? (
            <Link href="/driver/available-orders">
              <Button size="lg">
                <TruckIcon className="mr-2 h-5 w-5" />
                Voir les courses disponibles
              </Button>
            </Link>
          ) : (
            <Link href="/orders/create">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Nouvelle commande
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total {isDriver ? "livraisons" : "commandes"}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          {isDriver && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gains totaux</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.earnings)}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>{isDriver ? "Mes livraisons" : "Mes commandes"}</CardTitle>
            <CardDescription>
              {orders.length === 0
                ? "Aucune commande pour le moment"
                : `${orders.length} commande${orders.length > 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {isDriver
                    ? "Vous n'avez pas encore de livraisons"
                    : "Vous n'avez pas encore de commandes"}
                </p>
                {!isDriver && (
                  <Link href="/orders/create">
                    <Button>Créer une commande</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="mt-1">{getStatusIcon(order.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <p className="font-semibold">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {getStatusText(order.status)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {isDriver && order.driverEarnings
                                ? formatCurrency(order.driverEarnings)
                                : formatCurrency(order.totalPrice)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistance(order.distance)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {order.pickupAddress}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {order.deliveryAddress}
                            </span>
                          </div>
                        </div>
                        {isDriver && order.customer && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Client: {order.customer.name}
                          </p>
                        )}
                        {!isDriver && order.driver && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Livreur: {order.driver.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
