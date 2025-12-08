# GetMyChoose 🚀

Une plateforme de livraison collaborative moderne permettant aux particuliers d'envoyer des colis rapidement et aux livreurs de gagner de l'argent en complétant leurs trajets.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Business Model](#-business-model)
- [Roadmap](#-roadmap)

## ✨ Fonctionnalités

### MVP (Phase 1) ✅

- **Authentification complète**
  - Inscription / Connexion avec email et mot de passe
  - Gestion de session avec NextAuth.js
  - Profils distincts pour clients et livreurs

- **Système de commande**
  - Création de commande en 4 étapes
  - Calcul automatique du prix basé sur la distance et le type de colis
  - Support de 4 types de colis (Petit, Moyen, Grand, Extra Large)
  - Option de livraison express (+30%)

- **Tableau de bord**
  - Vue d'ensemble des commandes
  - Statistiques en temps réel
  - Historique complet des transactions

- **Profil livreur**
  - Sélection du type de véhicule
  - Gestion des documents (à venir)
  - Suivi des gains

### En développement (Phase 2)

- 📍 Tracking GPS en temps réel
- 💳 Intégration paiement Stripe
- 💬 Messagerie in-app
- ⭐ Système de notation
- 🗺️ Intégration Google Maps
- 📱 Applications mobiles natives

## 🛠 Stack Technique

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL avec Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe (à intégrer)
- **Maps**: Google Maps API (à intégrer)

## 🏗 Architecture

```
getmychoose/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   └── orders/          # Order management
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # User dashboard
│   ├── orders/              # Order management
│   │   └── create/          # Order creation flow
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   └── ui/                  # Reusable UI components
├── lib/                     # Utilities
│   ├── auth.ts              # Auth configuration
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Helper functions
├── prisma/                  # Database
│   └── schema.prisma        # Database schema
└── types/                   # TypeScript types
    └── next-auth.d.ts       # NextAuth types
```

## 📦 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/yourusername/getmychoose.git
cd getmychoose
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos propres valeurs :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/getmychoose?schema=public"

# NextAuth
NEXTAUTH_SECRET="votre-secret-aleatoire-super-securise"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optionnel pour le MVP)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Google Maps (optionnel pour le MVP)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="votre-cle-google-maps"

# App Config
COMMISSION_RATE=0.15
```

4. **Initialiser la base de données**
```bash
# Créer la base de données PostgreSQL
createdb getmychoose

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev --name init
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Base de données

Le schéma Prisma inclut :
- **User** : Utilisateurs (clients et livreurs)
- **Driver** : Profil livreur avec véhicule et documents
- **Order** : Commandes de livraison
- **Payment** : Transactions Stripe
- **Rating** : Système de notation
- **Document** : Documents des livreurs (permis, assurance, etc.)

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|---------|
| DATABASE_URL | URL de connexion PostgreSQL | ✅ |
| NEXTAUTH_SECRET | Secret pour NextAuth.js | ✅ |
| NEXTAUTH_URL | URL de l'application | ✅ |
| STRIPE_SECRET_KEY | Clé API Stripe | ⏳ Phase 2 |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Clé publique Stripe | ⏳ Phase 2 |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Clé Google Maps | ⏳ Phase 2 |

## 💻 Développement

### Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint

# Prisma Studio (UI pour la DB)
npx prisma studio

# Reset de la base de données
npx prisma migrate reset
```

### Structure des commits

Ce projet suit le workflow Git avec la branche :
- `claude/delivery-marketplace-mvp-01Mz5TK4WspsP9XwVh3TaoPq`

## 🚀 Déploiement

### Vercel (Recommandé)

1. Pusher le code sur GitHub
2. Importer le projet sur [Vercel](https://vercel.com)
3. Configurer les variables d'environnement
4. Déployer !

### Docker (Optionnel)

```dockerfile
# Dockerfile à créer
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

## 💼 Business Model

### Proposition de valeur

**Pour les clients** :
- Livraison rapide et personnalisée
- Suivi en temps réel
- Prix transparents

**Pour les livreurs** :
- Augmentation des revenus (+85% par livraison)
- Flexibilité totale
- Interface simple

### Tarification

| Type de colis | Poids | Multiplicateur | Prix de base |
|---------------|-------|----------------|--------------|
| Petit | < 5kg | 1.0x | À partir de 5€ |
| Moyen | 5-15kg | 1.3x | À partir de 6.50€ |
| Grand | 15-30kg | 1.6x | À partir de 8€ |
| Extra Large | > 30kg | 2.0x | À partir de 10€ |

**Formule de calcul** :
```
Prix de base = distance (km) × 1.50€ × multiplicateur
Prix express = Prix de base × 1.30
Commission = 15%
Gains livreur = 85%
```

### Revenus

- **Commission** : 15% sur chaque livraison
- **Options premium** : Livraison express (+30%)
- **Abonnements** : Forfaits pour utilisateurs réguliers (à venir)
- **Partenariats B2B** : Services dédiés aux entreprises (à venir)

## 🗺 Roadmap

### ✅ Phase 1 : MVP (6 mois)
- [x] Authentification utilisateurs
- [x] Création de commandes
- [x] Dashboard basique
- [x] Calcul de prix dynamique
- [ ] Onboarding livreurs avec documents

### 🔄 Phase 2 : Core Platform (4 mois)
- [ ] Matching commande-livreur
- [ ] Tracking GPS en temps réel
- [ ] Intégration paiement Stripe
- [ ] Messagerie in-app
- [ ] Système de notation

### 📱 Phase 3 : Production (4 mois)
- [ ] Applications mobiles (iOS/Android)
- [ ] Sécurité renforcée
- [ ] Analytics et BI
- [ ] Tests utilisateurs

### 🚀 Phase 4 : Croissance
- [ ] IA pour optimisation des routes
- [ ] Pricing dynamique
- [ ] Livraisons groupées
- [ ] Comptes entreprise
- [ ] API publique

## 📊 Métriques clés

- **Commission** : 15%
- **Délai moyen de livraison** : 30 minutes
- **Satisfaction cible** : 4.8/5 ⭐
- **Taux de réussite** : 98%

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Équipe

- **Développement** : Votre équipe
- **Design** : À définir
- **Business** : À définir

## 📞 Contact

Pour toute question : contact@getmychoose.com

---

Fait avec ❤️ pour révolutionner la livraison collaborative
