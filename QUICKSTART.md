# 🚀 Guide de Démarrage Rapide - GetMyChoose

## Installation en 5 minutes

### 1️⃣ Prérequis
```bash
# Vérifiez vos versions
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
psql --version  # >= 14.0
```

### 2️⃣ Installation

```bash
# Cloner et installer
git clone <votre-repo>
cd Getmychoose
npm install
```

### 3️⃣ Configuration de la base de données

```bash
# Créer la base de données PostgreSQL
createdb getmychoose

# Ou avec psql
psql -U postgres
CREATE DATABASE getmychoose;
\q

# Configurer l'URL dans .env
cp .env.example .env
# Éditez .env avec votre DATABASE_URL
```

Exemple `.env` :
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/getmychoose?schema=public"
NEXTAUTH_SECRET="votre-secret-tres-long-et-securise-minimum-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

### 4️⃣ Initialiser Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio pour voir la DB
npx prisma studio
```

### 5️⃣ Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## 🧪 Tester l'application

### Créer un compte client
1. Allez sur [http://localhost:3000](http://localhost:3000)
2. Cliquez sur "Inscription"
3. Sélectionnez "Client"
4. Remplissez le formulaire
5. Connectez-vous

### Créer une commande
1. Dans le dashboard, cliquez sur "Nouvelle commande"
2. Suivez les 4 étapes :
   - Adresses de retrait et livraison
   - Type de colis (Petit, Moyen, Grand, XL)
   - Informations du destinataire
   - Confirmation et tarif

### Créer un compte livreur
1. Déconnectez-vous
2. Inscrivez-vous à nouveau
3. Cette fois sélectionnez "Livreur"
4. Choisissez votre type de véhicule
5. Connectez-vous pour accéder au dashboard livreur

## 📊 Données de test (Optionnel)

Vous pouvez créer des données de test avec Prisma Studio :

```bash
npx prisma studio
```

Ou créer un script seed :

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Créer un client test
  const customer = await prisma.user.create({
    data: {
      email: 'client@test.com',
      password: '$2a$10$...',  // bcrypt hash de 'password123'
      name: 'Jean Client',
      role: 'CUSTOMER',
    },
  })

  // Créer un livreur test
  const driver = await prisma.user.create({
    data: {
      email: 'livreur@test.com',
      password: '$2a$10$...',
      name: 'Marie Livreur',
      role: 'DRIVER',
      driver: {
        create: {
          vehicleType: 'SCOOTER',
          isVerified: true,
        },
      },
    },
  })
}

main()
```

## 🐛 Problèmes courants

### Erreur de connexion à la base de données
```bash
# Vérifiez que PostgreSQL est lancé
sudo service postgresql status
sudo service postgresql start

# Vérifiez la connexion
psql -U postgres -d getmychoose
```

### Erreur Prisma Client
```bash
# Régénérer le client
rm -rf node_modules/.prisma
npx prisma generate
```

### Port 3000 déjà utilisé
```bash
# Utilisez un autre port
PORT=3001 npm run dev
```

### Erreur NextAuth Session
```bash
# Vérifiez que NEXTAUTH_SECRET est défini dans .env
# Il doit faire au moins 32 caractères
```

## 📱 Fonctionnalités disponibles

### ✅ Implémentées (MVP)
- [x] Authentification complète
- [x] Création de compte client/livreur
- [x] Création de commandes
- [x] Calculateur de prix dynamique
- [x] Dashboard client et livreur
- [x] Landing page professionnelle

### 🔜 Prochaines fonctionnalités (Phase 2)
- [ ] Tracking GPS en temps réel
- [ ] Paiement Stripe
- [ ] Matching automatique commande-livreur
- [ ] Messagerie in-app
- [ ] Système de notation
- [ ] Upload de documents livreurs

## 🎯 Prochaines étapes

1. **Configurer Stripe** (pour les paiements)
   ```bash
   # Créer un compte sur https://stripe.com
   # Ajouter les clés dans .env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Configurer Google Maps** (pour la géolocalisation)
   ```bash
   # Obtenir une clé API sur https://console.cloud.google.com
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
   ```

3. **Déployer sur Vercel**
   ```bash
   # Installer Vercel CLI
   npm i -g vercel

   # Déployer
   vercel
   ```

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)

## 🆘 Support

En cas de problème :
1. Consultez le README.md
2. Vérifiez les logs dans la console
3. Consultez la documentation technique
4. Ouvrez une issue sur GitHub

---

Bon développement ! 🚀
