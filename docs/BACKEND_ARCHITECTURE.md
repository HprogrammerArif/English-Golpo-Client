# English Golpo - NestJS Backend Architecture Specification
**Technology Stack**: NestJS • TypeScript • Prisma ORM • PostgreSQL • Redis • Docker • RevenueCat Webhooks

---

## 1. Architectural Introduction & System Overview

The `English Golpo` backend is built as a robust, highly scalable REST API designed using **Domain-Driven Design (DDD)** and NestJS modular framework guidelines. The backend acts as the single source of truth for user accounts, gamification state (streaks, levels, XP), purchase transactions, and localized educational content.

### Core Architectural Goals
*   **SOLID & Clean Architecture**: Logic is strictly partitioned into controllers (delivery/routing), services (business rule execution), and repositories/Prisma queries (data access).
*   **Idempotency & Reliability in Payments**: Absolute validation of bKash, Nagad, Stripe, and Store subscriptions, preventing double-provisioning or security bypasses.
*   **High Performance**: Caching static metadata (e.g., stories, vocabulary indexes) in Redis to guarantee sub-50ms read response times under load.
*   **Offline Reconciliation**: Intelligent delta-based syncing for users reading stories offline.

---

## 2. Directory Structure (Domain-Driven NestJS)

We employ a domain-driven module structure where each capability (auth, story, payment) holds its controllers, services, database wrappers, and DTOs.

```
backend/
├── src/
│   ├── app.module.ts                 # Root NestJS Module
│   ├── main.ts                       # Server bootstrap script (CORS, Pipes, Swagger)
│   │
│   ├── common/                       # Shared Utilities & NestJS Elements
│   │   ├── decorators/               # @CurrentUser, @Public route decorators
│   │   ├── filters/                  # HttpExceptionFilter, PrismaClientExceptionFilter
│   │   ├── guards/                   # JwtAuthGuard, RolesGuard
│   │   └── interceptors/             # LoggingInterceptor, TransformInterceptor
│   │
│   ├── modules/                      # Domain Modules
│   │   ├── auth/                     # Auth module (Google, Apple, Phone OTP)
│   │   ├── user/                     # Profile details, current path config
│   │   ├── story/                    # Book chapters, page mapping, word transcripts
│   │   ├── quiz/                     # Quiz validation and progress tracking
│   │   ├── gamification/             # XP tracking, streaks scheduler, levels
│   │   └── payment/                  # Payment integrations (bKash, Nagad, Stripe, IAP)
│   │
│   └── prisma/
│       ├── prisma.module.ts          # Exposes PrismaService globally
│       └── prisma.service.ts         # Prisma DB Connection manager
│
├── prisma/
│   ├── schema.prisma                 # PostgreSQL database schemas
│   └── seed.ts                       # Pre-populate levels, stories, and vocab tokens
│
├── test/                             # E2E test suites
├── docker-compose.yml                # Config for PostgreSQL & Redis
├── Dockerfile                        # Multi-stage production build configuration
└── package.json
```

---

## 3. Database Schema (Prisma ORM & PostgreSQL)

The schema defines learning paths, story translation structures, bookmarks, streaks, and payment records.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum LearningPath {
  KIDS
  SPOKEN
  IELTS
  ADMISSION
  JOB
  VOCAB
}

enum PaymentGateway {
  BKASH
  NAGAD
  STRIPE
  PLAY_STORE
  APP_STORE
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PENDING
}

model User {
  id            String             @id @default(uuid())
  email         String?            @unique
  phone         String?            @unique
  passwordHash  String?
  name          String
  avatarUrl     String?
  role          String             @default("FREE") // FREE or PREMIUM
  learningPath  LearningPath?
  lives         Int                @default(5)
  gems          Int                @default(0)
  league        String             @default("BRONZE")
  lastLifeRefill DateTime?
  parentId      String?            // Links to parent account
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  
  // Relations
  progress      UserProgress[]
  streak        Streak?
  dailyGoals    DailyGoal[]
  bookmarks     Bookmark[]
  subscriptions Subscription[]
  payments      PaymentTransaction[]
  inventory     UserItem[]
  children      User[]             @relation("ParentChild")
  parent        User?              @relation("ParentChild", fields: [parentId], references: [id])
  organizationId String?
  organization  B2BOrganization?   @relation(fields: [organizationId], references: [id])
  referralsMade Referral[]         @relation("Referrer")
  referralsRecv Referral[]         @relation("Referee")
}

model Story {
  id              String         @id @default(uuid())
  title           String
  description     String
  level           Int            // Level 1 (Kids), 2 (Inter), etc.
  learningPath    LearningPath
  illustrationUrl String
  audioUrl        String
  createdAt       DateTime       @default(now())
  
  // Relations
  pages           StoryPage[]
  progress        UserProgress[]
}

model StoryPage {
  id        String     @id @default(uuid())
  storyId   String
  story     Story      @relation(fields: [storyId], references: [id], onDelete: Cascade)
  pageIndex Int
  imageUrl  String

  // Relations
  sentences Sentence[]
}

model Sentence {
  id          String      @id @default(uuid())
  pageId      String
  page        StoryPage   @relation(fields: [pageId], references: [id], onDelete: Cascade)
  sentenceIdx Int
  englishText String
  banglaText  String
  startTime   Float       // Audio offset timestamp in seconds
  endTime     Float       // Audio offset timestamp in seconds

  // Relations
  tokens      WordToken[]
}

model WordToken {
  id               String   @id @default(uuid())
  sentenceId       String
  sentence         Sentence @relation(fields: [sentenceId], references: [id], onDelete: Cascade)
  english          String
  bangla           String
  sentenceContext  String
  pronunciationG   String?  // IPA phonetic guide (e.g. "ˈɛpəl")
}

model Bookmark {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  englishWord  String
  banglaMeaning String
  context      String
  savedAt      DateTime  @default(now())

  @@unique([userId, englishWord])
}

model UserProgress {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  storyId     String
  story       Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  completed   Boolean  @default(false)
  score       Int      @default(0)
  updatedAt   DateTime @updatedAt

  @@unique([userId, storyId])
}

model Streak {
  id             String    @id @default(uuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  currentStreak  Int       @default(0)
  longestStreak  Int       @default(0)
  lastActiveDate DateTime?
}

model DailyGoal {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date         DateTime @db.Date
  targetXp     Int      @default(50)
  earnedXp     Int      @default(0)

  @@unique([userId, date])
}

model LeaderboardEntry {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  league       String
  weekStarting DateTime @db.Date
  xpEarned     Int      @default(0)

  @@unique([userId, weekStarting])
}

model UserItem {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemType     String   // STREAK_FREEZE, AVATAR_OUTFIT
  quantity     Int      @default(1)
  purchasedAt  DateTime @default(now())
}

model Subscription {
  id             String             @id @default(uuid())
  userId         String
  user           User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  gateway        PaymentGateway
  status         SubscriptionStatus @default(PENDING)
  expiryDate     DateTime
  subscriptionId String?            @unique // Stripe sub ID or RevenueCat transaction ID
  createdAt      DateTime           @default(now())
}

model PaymentTransaction {
  id            String             @id @default(uuid())
  userId        String
  user          User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  gateway       PaymentGateway
  transactionId String             @unique
  amount        Float
  currency      String             @default("BDT")
  status        String             // SUCCESS, FAILED, CANCELLED
  createdAt     DateTime           @default(now())
}

model Referral {
  id            String             @id @default(uuid())
  referrerId    String
  referrer      User               @relation("Referrer", fields: [referrerId], references: [id])
  refereeId     String
  referee       User               @relation("Referee", fields: [refereeId], references: [id])
  status        String             @default("PENDING") // PENDING, COMPLETED
  rewardGranted Boolean            @default(false)
  createdAt     DateTime           @default(now())

  @@unique([referrerId, refereeId])
}

model B2BOrganization {
  id            String             @id @default(uuid())
  name          String
  type          String             // SCHOOL, TUTORIAL_CENTER, FAMILY
  licenseCount  Int                @default(1)
  adminId       String             @unique
  members       User[]
  createdAt     DateTime           @default(now())
}
```

---

## 4. REST API Endpoint Specifications

### 4.1 Authentication (`/api/auth`)
*   `POST /register`: Registers user with target Age group & Learning path.
*   `POST /login/phone`: Initiates OTP verification request.
*   `POST /login/phone/verify`: Resolves OTP verification, registers JWT.
*   `POST /login/sso`: Authenticates Google/Apple ID payload.

### 4.2 Stories & Paths (`/api/stories`)
*   `GET /paths`: Fetches learning paths and user current roadmap.
*   `GET /`: Fetches stories for active level and path (Requires auth status check: Free tier allows maximum 40 stories; returns paywall trigger error if limit exceeded).
*   `GET /:id`: Full JSON payload containing chapters, image cards, sound mapping timestamps.

### 4.3 Vocabulary & Progress (`/api/progress`)
*   `POST /sync`: Batch synchronizes offline progress.
*   `POST /bookmarks`: Saves custom vocabulary bookmark.
*   `DELETE /bookmarks/:word`: Removes bookmark.

### 4.4 Gamification & Leaderboards (`/api/gamification`)
*   `POST /xp/add`: Increments XP points, recalibrates level progression, League standings, and Daily Goals.
*   `GET /streak`: Returns active streak counters and calendar history.
*   `GET /leaderboard`: Returns the top 30 cohort for the user's current League.

### 4.5 Shop & Virtual Economy (`/api/shop`)
*   `POST /buy`: Spend Gems to buy Streak Freezes, Extra Lives, or Avatar cosmetics.
*   `POST /refill-lives`: Triggers an ad-based life refill (requires validation token from AdMob).

### 4.6 Parental Control & Family/B2B (`/api/accounts`)
*   `GET /parents/dashboard`: Returns children's progress (XP, completed stories, daily goal status).
*   `POST /parents/link-child`: Creates a managed sub-account for a kid.
*   `POST /b2b/provision`: Allows School Admin / Family Head to provision licenses and invite members.

### 4.7 Growth & Referrals (`/api/growth`)
*   `POST /referral/invite`: Generates deep-link tracking URL for user.
*   `POST /referral/redeem`: Validates a referee signup and grants 7-day Premium status to both users if rules are met.
*   `POST /events/track`: S2S Endpoint to log A/B testing flag exposures and paywall conversions for CRM triggers.

---

## 5. Local Payment Gateways API Integration Flows

To successfully monetization in Bangladesh, local gateways must execute securely via Server-to-Server callbacks.

### 5.1 bKash Checkout (Tokenized API)

#### Step 1: Request Payment Session from Frontend
*   User taps "Purchase Premium - bKash" on the mobile UI.
*   Frontend posts target billing plan (e.g., Monthly 45 BDT or Yearly 320 BDT) to `/api/payment/bkash/create`.

#### Step 2: Backend Calls bKash Gateways (Server-to-Server)
The NestJS controller initializes the checkout with bKash API:
```typescript
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import axios from 'axios';

@Controller('api/payment/bkash')
export class BkashController {
  
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPayment(@Req() req, @Body('planId') planId: string) {
    const amount = planId === 'yearly' ? '320.00' : '45.00';
    
    // Call bKash Grant Token API first, then call Create Payment
    const token = await this.getBkashToken();
    
    const response = await axios.post(
      process.env.BKASH_CREATE_PAYMENT_URL,
      {
        mode: '0011', // Tokenized Checkout Mode
        payerReference: req.user.phone || req.user.id,
        callbackURL: `${process.env.BACKEND_URL}/api/payment/bkash/callback`,
        amount: amount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `INV_${Date.now()}`,
      },
      {
        headers: {
          Authorization: token,
          'X-APP-Key': process.env.BKASH_APP_KEY,
        },
      }
    );

    // Returns checkoutUrl to frontend WebView
    return {
      checkoutUrl: response.data.bkashURL,
      paymentId: response.data.paymentID,
    };
  }

  private async getBkashToken(): Promise<string> {
    const response = await axios.post(
      process.env.BKASH_GRANT_TOKEN_URL,
      {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
      },
      {
        headers: {
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD,
        },
      }
    );
    return response.data.id_token;
  }
}
```

#### Step 3: Callback Interception & Payment Execution
bKash redirects to the webhook callback upon completion:
```typescript
  @Post('callback')
  async paymentCallback(@Req() req) {
    const { status, paymentID } = req.query;
    
    if (status === 'success') {
      // Server-to-server: Execute the payment transaction on bKash side
      const token = await this.getBkashToken();
      const executeResponse = await axios.post(
        process.env.BKASH_EXECUTE_PAYMENT_URL,
        { paymentID },
        {
          headers: {
            Authorization: token,
            'X-APP-Key': process.env.BKASH_APP_KEY,
          },
        }
      );

      if (executeResponse.data.transactionStatus === 'Completed') {
        // Update database: Save PaymentTransaction and create Subscription
        await this.paymentService.confirmPayment({
          userId: executeResponse.data.payerReference,
          gateway: 'BKASH',
          transactionId: executeResponse.data.trxID,
          amount: parseFloat(executeResponse.data.amount),
        });
        
        return { redirect: `${process.env.BACKEND_URL}/api/payment/success?transactionId=${executeResponse.data.trxID}` };
      }
    }
    
    return { redirect: `${process.env.BACKEND_URL}/api/payment/fail` };
  }
```

---

### 5.2 Nagad Checkout (Redirect & Signature Verification)

Nagad requires encrypting request payloads using private keys (OpenSSL) and verifying parameters via public keys on the callback URL.

#### Process Sequence
1.  **Initialize Transaction**: Backend calls Nagad `/api/payment/initialize` to get standard session token.
2.  **Generate Signature**: Encrypt fields (`merchantId`, `orderId`, `amount`, `datetime`) using SHA-256 and merchant private keys.
3.  **Execute Checkout Redirect**: Forward user webview to Nagad checkout screen.
4.  **Confirm Callback**: Nagad issues a server-to-server validation callback with decryptable params (signature). Backend matches against public key, verifies amount, sets transaction to `SUCCESS`, and updates DB record.

---

### 5.3 RevenueCat Webhooks (App Store & Google Play)

For native subscriptions via StoreKit and Google Play Billing, the backend consumes **RevenueCat S2S Webhooks** to avoid certificate management and client spoofing.

#### `/api/payment/revenuecat-webhook` (POST)
When a user subscribes inside Apple App Store or Google Play:
1.  RevenueCat processes the receipt validation.
2.  RevenueCat sends webhooks payload containing:
    *   `event.type`: `INITIAL_PURCHASE` or `RENEWAL` or `CANCELLATION`.
    *   `event.app_user_id`: The system User ID.
    *   `event.expiration_at_ms`: Expiry timestamp.
3.  NestJS verifies request header signature (`X-RevenueCat-Signature`).
4.  Updates local user subscription record status to `ACTIVE` and modifies role to `PREMIUM`.

---

## 6. Scaling & Performance Architecture

*   **Redis Caching Policy**:
    *   Cache keys: `stories:list`, `stories:details:${storyId}`, `levels:map`.
    *   Eviction policy: Cache invalidation upon Story changes via CMS (using Prisma Hooks).
*   **Database Query Optimization**:
    *   Indexes configured on: `Bookmark(userId, englishWord)`, `UserProgress(userId, storyId)`, and `DailyGoal(userId, date)`.
*   **Database Connection Pooling**:
    *   Use connection pooling tools (e.g. pgBouncer) when deploying database to handle spikes from concurrent users.
