"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft, Star } from "lucide-react";

export default function RateOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Veuillez sélectionner une note");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: params.id,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        router.push(`/orders/${params.id}`);
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'envoi de l'évaluation");
      }
    } catch (error) {
      alert("Erreur lors de l'envoi de l'évaluation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GetMyChoose</span>
          </Link>
          <Link href={`/orders/${params.id}`}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Évaluer cette livraison</CardTitle>
            <CardDescription>
              Votre avis aide à maintenir la qualité du service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-3">
                <Label className="text-base">Votre note</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-12 w-12 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-4 text-2xl font-bold text-primary">
                      {rating}/5
                    </span>
                  )}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {rating === 1 && "Très insatisfait"}
                    {rating === 2 && "Insatisfait"}
                    {rating === 3 && "Moyen"}
                    {rating === 4 && "Satisfait"}
                    {rating === 5 && "Excellent !"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-3">
                <Label htmlFor="comment" className="text-base">
                  Commentaire (optionnel)
                </Label>
                <textarea
                  id="comment"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Partagez votre expérience avec cette livraison..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Décrivez ce qui s'est bien passé ou ce qui pourrait être amélioré
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Link href={`/orders/${params.id}`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={loading || rating === 0} className="flex-1">
                  {loading ? "Envoi..." : "Envoyer l'évaluation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-900">Conseils pour une bonne évaluation</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Soyez honnête et constructif</li>
            <li>• Mentionnez les points positifs et les axes d'amélioration</li>
            <li>• Évitez les commentaires offensants</li>
            <li>• Votre avis sera visible publiquement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
