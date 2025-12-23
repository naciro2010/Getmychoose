"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Users,
  TruckIcon,
  Euro,
  FileText,
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  overview: {
    totalUsers: number;
    totalCustomers: number;
    totalDrivers: number;
    totalOrders: number;
    totalRevenue: number;
    commission: number;
    pendingDocuments: number;
    activeOrders: number;
    completedOrders: number;
    averageRating: number;
    conversionRate: number;
  };
  recentOrders: any[];
  topDrivers: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
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

  if (!stats) {
    return null;
  }

  const kpiCards = [
    {
      title: "Utilisateurs Totaux",
      value: stats.overview.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `${stats.overview.totalCustomers} clients, ${stats.overview.totalDrivers} livreurs`,
    },
    {
      title: "Commandes Totales",
      value: stats.overview.totalOrders,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${stats.overview.activeOrders} en cours, ${stats.overview.completedOrders} complétées`,
    },
    {
      title: "Revenu Total",
      value: formatCurrency(stats.overview.totalRevenue),
      icon: Euro,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: `Commission: ${formatCurrency(stats.overview.commission)}`,
    },
    {
      title: "Note Moyenne",
      value: stats.overview.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Sur 5 étoiles",
    },
    {
      title: "Taux de Conversion",
      value: `${stats.overview.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Commandes complétées",
    },
    {
      title: "Documents en Attente",
      value: stats.overview.pendingDocuments,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "À vérifier",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">GetMyChoose Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <Activity className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Utilisateurs
                </Button>
              </Link>
              <Link href="/admin/documents">
                <Button variant="ghost" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Documents
                  {stats.overview.pendingDocuments > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {stats.overview.pendingDocuments}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="ghost" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
            </nav>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Retour au site</Button>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de la plateforme GetMyChoose
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>Les 10 dernières commandes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${order.status === "DELIVERED" ? "bg-green-100" :
                          order.status === "CANCELLED" ? "bg-red-100" :
                            "bg-blue-100"
                        }`}>
                        {order.status === "DELIVERED" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : order.status === "CANCELLED" ? (
                          <Clock className="h-4 w-4 text-red-600" />
                        ) : (
                          <TruckIcon className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer?.name} → {order.driver?.name || "En attente"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(order.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Livreurs</CardTitle>
              <CardDescription>Les 5 meilleurs livreurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topDrivers.map((driver, index) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{driver.user.name}</p>
                        <p className="text-xs text-muted-foreground">{driver.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm flex items-center gap-1">
                        <TruckIcon className="h-3 w-3" />
                        {driver.totalDeliveries} livraisons
                      </p>
                      {driver.averageRating && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {driver.averageRating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Link href="/admin/documents">
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Vérifier Documents
                  {stats.overview.pendingDocuments > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {stats.overview.pendingDocuments}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer Utilisateurs
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button className="w-full" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Voir Analytics
                </Button>
              </Link>
              <Button className="w-full" variant="outline" onClick={fetchStats}>
                <Activity className="mr-2 h-4 w-4" />
                Rafraîchir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
