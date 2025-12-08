"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package,
  Users,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  TruckIcon,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  driver?: {
    isVerified: boolean;
    isActive: boolean;
    totalDeliveries: number;
    averageRating?: number;
  };
  _count: {
    ordersAsCustomer: number;
    ordersAsDriver: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchUsers();
      }
    }
  }, [status, session, roleFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      CUSTOMER: { label: "Client", color: "bg-blue-100 text-blue-800" },
      DRIVER: { label: "Livreur", color: "bg-green-100 text-green-800" },
      ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-800" },
    };
    return badges[role] || { label: role, color: "bg-gray-100 text-gray-800" };
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
          <h1 className="text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            {pagination.total} utilisateur{pagination.total > 1 ? "s" : ""} enregistré
            {pagination.total > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres et Recherche</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nom ou email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Filtrer par rôle</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="CUSTOMER">Clients</option>
                    <option value="DRIVER">Livreurs</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user) => {
            const roleBadge = getRoleBadge(user.role);
            return (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${roleBadge.color}`}>
                            {roleBadge.label}
                          </span>
                          {user.driver?.isVerified && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>

                        {user.role === "DRIVER" && user.driver && (
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <TruckIcon className="h-4 w-4" />
                              <span className="font-medium">
                                {user.driver.totalDeliveries} livraisons
                              </span>
                            </div>
                            {user.driver.averageRating && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {user.driver.averageRating.toFixed(1)}★
                                </span>
                              </div>
                            )}
                            <div className={`flex items-center gap-1 ${
                              user.driver.isActive ? "text-green-600" : "text-red-600"
                            }`}>
                              {user.driver.isActive ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              <span>{user.driver.isActive ? "Actif" : "Inactif"}</span>
                            </div>
                          </div>
                        )}

                        {user.role === "CUSTOMER" && (
                          <div className="mt-3 text-sm">
                            <span className="font-medium">
                              {user._count.ordersAsCustomer} commande
                              {user._count.ordersAsCustomer > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <p>Inscrit le</p>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
