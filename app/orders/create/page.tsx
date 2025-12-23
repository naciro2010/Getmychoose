"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, User, Phone, AlertCircle, ArrowLeft } from "lucide-react";
import { calculatePrice, formatCurrency, formatDistance, estimateDeliveryTime } from "@/lib/utils";

export default function CreateOrderPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orderData, setOrderData] = useState({
    // Pickup
    pickupAddress: "",
    pickupLat: 48.8566,
    pickupLng: 2.3522,
    pickupName: "",
    pickupPhone: "",

    // Delivery
    deliveryAddress: "",
    deliveryLat: 48.8606,
    deliveryLng: 2.3376,
    deliveryName: "",
    deliveryPhone: "",

    // Package
    packageType: "SMALL",
    packageWeight: "",
    packageDescription: "",
    prohibitedItems: false,

    // Timing
    isUrgent: false,
    isScheduled: false,
    scheduledFor: "",
  });

  // Calculate pricing
  const distance = 5.2; // Mock distance - would use Google Maps API in production
  const pricing = calculatePrice(distance, orderData.packageType, orderData.isUrgent);
  const deliveryTime = estimateDeliveryTime(distance);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...orderData,
          distance,
          ...pricing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      // Redirect to payment
      router.push(`/orders/${data.orderId}/payment`);
    } catch (error) {
      setError("Une erreur est survenue lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-4xl py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Nouvelle commande</h1>
          <p className="text-muted-foreground">Créez une nouvelle livraison en quelques étapes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[
            { num: 1, label: "Adresses" },
            { num: 2, label: "Colis" },
            { num: 3, label: "Destinataire" },
            { num: 4, label: "Confirmation" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
              >
                {s.num}
              </div>
              <span className="text-sm mt-2 hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Addresses */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Adresses de retrait et de livraison</CardTitle>
              <CardDescription>Indiquez où récupérer et livrer le colis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Adresse de retrait
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Adresse</Label>
                  <Input
                    id="pickupAddress"
                    placeholder="123 Rue de la République, 75001 Paris"
                    value={orderData.pickupAddress}
                    onChange={(e) => setOrderData({ ...orderData, pickupAddress: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupName">Nom du contact (optionnel)</Label>
                    <Input
                      id="pickupName"
                      placeholder="Jean Dupont"
                      value={orderData.pickupName}
                      onChange={(e) => setOrderData({ ...orderData, pickupName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupPhone">Téléphone (optionnel)</Label>
                    <Input
                      id="pickupPhone"
                      placeholder="+33 6 12 34 56 78"
                      value={orderData.pickupPhone}
                      onChange={(e) => setOrderData({ ...orderData, pickupPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Adresse de livraison
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Adresse</Label>
                  <Input
                    id="deliveryAddress"
                    placeholder="456 Avenue des Champs-Élysées, 75008 Paris"
                    value={orderData.deliveryAddress}
                    onChange={(e) => setOrderData({ ...orderData, deliveryAddress: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full" disabled={!orderData.pickupAddress || !orderData.deliveryAddress}>
                Continuer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Package Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Détails du colis</CardTitle>
              <CardDescription>Informations sur le colis à livrer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="packageType">Type de colis</Label>
                <select
                  id="packageType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={orderData.packageType}
                  onChange={(e) => setOrderData({ ...orderData, packageType: e.target.value })}
                >
                  <option value="SMALL">Petit (&lt; 5kg)</option>
                  <option value="MEDIUM">Moyen (5-15kg)</option>
                  <option value="LARGE">Grand (15-30kg)</option>
                  <option value="EXTRA_LARGE">Extra Large (&gt; 30kg)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageWeight">Poids estimé (kg)</Label>
                <Input
                  id="packageWeight"
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={orderData.packageWeight}
                  onChange={(e) => setOrderData({ ...orderData, packageWeight: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageDescription">Description du colis (optionnel)</Label>
                <textarea
                  id="packageDescription"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Ex: Documents importants, vêtements, etc."
                  value={orderData.packageDescription}
                  onChange={(e) => setOrderData({ ...orderData, packageDescription: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="prohibitedItems"
                  checked={orderData.prohibitedItems}
                  onChange={(e) => setOrderData({ ...orderData, prohibitedItems: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="prohibitedItems" className="text-sm font-normal">
                  Je certifie que le colis ne contient pas d&apos;objets interdits (armes, produits dangereux, etc.)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={orderData.isUrgent}
                  onChange={(e) => setOrderData({ ...orderData, isUrgent: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isUrgent" className="text-sm font-normal">
                  Livraison express (+30%)
                </Label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Retour
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1" disabled={!orderData.prohibitedItems}>
                  Continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Recipient */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Informations du destinataire</CardTitle>
              <CardDescription>Coordonnées de la personne qui va recevoir le colis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deliveryName">Nom du destinataire *</Label>
                <Input
                  id="deliveryName"
                  placeholder="Marie Martin"
                  value={orderData.deliveryName}
                  onChange={(e) => setOrderData({ ...orderData, deliveryName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryPhone">Téléphone du destinataire *</Label>
                <Input
                  id="deliveryPhone"
                  placeholder="+33 6 98 76 54 32"
                  value={orderData.deliveryPhone}
                  onChange={(e) => setOrderData({ ...orderData, deliveryPhone: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Retour
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1" disabled={!orderData.deliveryName || !orderData.deliveryPhone}>
                  Continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
              <CardDescription>Vérifiez les informations avant de continuer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Retrait</p>
                    <p className="text-sm text-muted-foreground">{orderData.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Livraison</p>
                    <p className="text-sm text-muted-foreground">{orderData.deliveryAddress}</p>
                    <p className="text-sm text-muted-foreground">Pour: {orderData.deliveryName}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-semibold">{formatDistance(distance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type de colis</span>
                  <span className="font-semibold">{orderData.packageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temps de livraison estimé</span>
                  <span className="font-semibold">{deliveryTime} min</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix de base</span>
                  <span>{formatCurrency(pricing.basePrice)}</span>
                </div>
                {pricing.urgencyFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais express</span>
                    <span>{formatCurrency(pricing.urgencyFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(pricing.totalPrice)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Retour
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? "Création..." : "Confirmer et payer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
