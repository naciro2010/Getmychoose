# GetMyChoose Backend - Kotlin/Spring Boot

Backend API pour la plateforme GetMyChoose, développé avec Kotlin et Spring Boot.

## Technologies

- **Kotlin 1.9** - Langage de programmation
- **Spring Boot 3.2** - Framework backend
- **Spring Security** - Authentification JWT
- **Spring Data JPA** - ORM/Persistence
- **PostgreSQL** - Base de données
- **Gradle** - Build tool

## Prérequis

- Java 17+
- PostgreSQL 15+
- Gradle 8+ (ou utiliser le wrapper inclus)

## Configuration

Créez un fichier `.env` ou configurez les variables d'environnement :

```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/getmychoose
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your-256-bit-secret-key-for-jwt-signing-must-be-at-least-32-characters
CORS_ORIGINS=http://localhost:3000
```

## Démarrage

### Avec Docker (recommandé)

```bash
docker-compose up -d
```

### Sans Docker

1. Démarrer PostgreSQL
2. Créer la base de données :
```sql
CREATE DATABASE getmychoose;
```
3. Lancer l'application :
```bash
./gradlew bootRun
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Inscription utilisateur |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Utilisateur courant |
| GET | `/api/auth/session` | Session info |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Créer une commande |
| GET | `/api/orders` | Liste des commandes |
| GET | `/api/orders/{id}` | Détails commande |
| PATCH | `/api/orders/{id}` | Mise à jour statut |
| GET | `/api/orders/available` | Commandes disponibles (drivers) |

### Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ratings` | Créer une évaluation |

### Driver
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/driver/documents` | Documents du chauffeur |
| POST | `/api/driver/documents` | Upload document |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Statistiques dashboard |
| GET | `/api/admin/users` | Liste utilisateurs |
| PATCH | `/api/admin/users` | Modifier utilisateur |
| GET | `/api/admin/documents` | Documents en attente |
| PATCH | `/api/admin/documents/{id}` | Valider/Rejeter document |

## Structure du Projet

```
src/main/kotlin/com/getmychoose/
├── config/           # Configuration (Security, CORS, Jackson)
├── controller/       # REST Controllers
├── dto/              # Data Transfer Objects
├── entity/           # JPA Entities
├── exception/        # Exception handlers
├── repository/       # Spring Data repositories
├── security/         # JWT, Authentication
└── service/          # Business logic
```

## Authentification

L'API utilise JWT Bearer tokens. Incluez le token dans le header :

```
Authorization: Bearer <votre-token>
```

## Modèles de Données

- **User** - Utilisateurs (Customer, Driver, Admin)
- **Driver** - Profil chauffeur
- **Order** - Commandes de livraison
- **Payment** - Paiements
- **Rating** - Évaluations
- **Document** - Documents chauffeur

## Tests

```bash
./gradlew test
```

## Build Production

```bash
./gradlew build
java -jar build/libs/getmychoose-backend-1.0.0.jar
```
