import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  TruckIcon,
  MapPin,
  Clock,
  Euro,
  Star,
  Shield,
  Smartphone,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">GetMyChoose</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              Comment ça marche
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Tarifs
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Inscription</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
          <div className="container relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Livraison rapide
                <span className="block text-primary">entre particuliers</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Envoyez vos colis en quelques clics ou devenez livreur et gagnez de l&apos;argent
                en complétant vos trajets quotidiens.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register?type=customer">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Package className="mr-2 h-5 w-5" />
                    Envoyer un colis
                  </Button>
                </Link>
                <Link href="/auth/register?type=driver">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <TruckIcon className="mr-2 h-5 w-5" />
                    Devenir livreur
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary">15%</div>
                  <div className="text-sm text-muted-foreground">Commission</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">30min</div>
                  <div className="text-sm text-muted-foreground">Livraison moyenne</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">4.8★</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pourquoi choisir GetMyChoose ?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Une plateforme moderne, sécurisée et facile à utiliser
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Livraison Rapide</CardTitle>
                  <CardDescription>
                    Vos colis livrés en 30 minutes en moyenne dans votre ville
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <MapPin className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Suivi en Temps Réel</CardTitle>
                  <CardDescription>
                    Suivez votre livreur en direct sur la carte avec ETA précis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Euro className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Prix Transparents</CardTitle>
                  <CardDescription>
                    Tarification claire basée sur la distance et le type de colis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Sécurisé</CardTitle>
                  <CardDescription>
                    Paiements sécurisés, livreurs vérifiés et assurance incluse
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Star className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Système de Notes</CardTitle>
                  <CardDescription>
                    Évaluez votre expérience et consultez les avis des autres utilisateurs
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Smartphone className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Application Mobile</CardTitle>
                  <CardDescription>
                    Disponible sur iOS et Android pour une expérience optimale
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-muted/50 py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Comment ça marche ?
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-2">
              {/* For Customers */}
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  Pour les clients
                </h3>
                <div className="space-y-4">
                  {[
                    "Entrez les adresses de départ et d'arrivée",
                    "Choisissez le type de colis et obtenez un devis instantané",
                    "Confirmez et payez en ligne de manière sécurisée",
                    "Un livreur accepte votre commande en quelques minutes",
                    "Suivez votre colis en temps réel sur la carte",
                    "Recevez une notification à la livraison et notez le livreur"
                  ].map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* For Drivers */}
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TruckIcon className="h-6 w-6 text-primary" />
                  Pour les livreurs
                </h3>
                <div className="space-y-4">
                  {[
                    "Inscrivez-vous et validez vos documents",
                    "Choisissez votre véhicule (vélo, scooter, voiture...)",
                    "Activez votre statut 'En ligne' quand vous êtes disponible",
                    "Consultez les courses disponibles sur votre itinéraire",
                    "Acceptez les courses qui vous conviennent",
                    "Gagnez 85% du montant de chaque livraison"
                  ].map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tarification Simple et Transparente
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Prix calculés automatiquement selon la distance et le type de colis
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              {[
                { type: "Petit", weight: "< 5kg", price: "À partir de 5€", multiplier: "1.0x" },
                { type: "Moyen", weight: "5-15kg", price: "À partir de 6.50€", multiplier: "1.3x" },
                { type: "Grand", weight: "15-30kg", price: "À partir de 8€", multiplier: "1.6x" },
                { type: "Extra Large", weight: "> 30kg", price: "À partir de 10€", multiplier: "2.0x" }
              ].map((tier) => (
                <Card key={tier.type}>
                  <CardHeader>
                    <CardTitle>{tier.type}</CardTitle>
                    <CardDescription>{tier.weight}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">{tier.price}</div>
                    <p className="text-sm text-muted-foreground mb-4">Multiplicateur: {tier.multiplier}</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Suivi en temps réel
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Assurance incluse
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Support 24/7
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                + Option livraison express : +30% du prix de base
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Base: 1.50€/km • Commission: 15% • Livreurs gagnent 85%
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Prêt à commencer ?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/90">
                Rejoignez des milliers d&apos;utilisateurs satisfaits
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register?type=customer">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Créer un compte client
                  </Button>
                </Link>
                <Link href="/auth/register?type=driver">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Devenir livreur
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features">Fonctionnalités</Link></li>
                <li><Link href="#pricing">Tarifs</Link></li>
                <li><Link href="/app">Application</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">À propos</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Carrières</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help">Centre d&apos;aide</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Confidentialité</Link></li>
                <li><Link href="/terms">CGU</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 GetMyChoose. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
