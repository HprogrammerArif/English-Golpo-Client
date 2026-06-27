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
backend-en-golpo-nest/
├── src/
│   ├── app.module.ts                 # Root NestJS Module (registers all 11 domain modules)
│   ├── main.ts                       # Server bootstrap (CORS, ValidationPipe, Swagger)
│   │
│   ├── common/                       # Shared Utilities & NestJS Elements
│   │   ├── decorators/               # @CurrentUser, @Public route decorators
│   │   ├── filters/                  # HttpExceptionFilter, PrismaClientExceptionFilter
│   │   ├── guards/                   # JwtAuthGuard, RolesGuard
│   │   └── interceptors/             # LoggingInterceptor, TransformInterceptor
│   │
│   ├── modules/                      # Domain Modules (all implemented)
│   │   ├── auth/                     # JWT auth: phone OTP, email/password login & register
│   │   ├── user/                     # Profile CRUD, path change, NCTB class
│   │   ├── story/                    # Stories, sentences, word tokens, paywall enforcement
│   │   ├── quiz/                     # Quiz validation, score tracking, auto mistake logging
│   │   ├── gamification/             # XP, streaks, leagues, leaderboard, daily goals
│   │   ├── progress/                 # Bookmarks (SM-2), flashcard reviews, mistakes, sentence patterns, learned vocab
│   │   ├── shop/                     # Gem-based virtual economy (Streak Freeze, Lives, Avatars)
│   │   ├── payment/                  # bKash, Nagad, Stripe, RevenueCat webhook integration
│   │   ├── growth/                   # Referrals, share-card generation, app review prompts
│   │   ├── accounts/                 # Parental control, B2B org management, child linking
│   │   └── video/                    # Video lessons (YouTube-embedded), watch progress, XP awards
│   │
│   └── prisma/
│       ├── prisma.module.ts          # Exposes PrismaService globally
│       └── prisma.service.ts         # Prisma DB Connection + PrismaPg adapter
│
├── prisma/
│   ├── schema.prisma                 # Full PostgreSQL schema (20+ models)
│   ├── prisma.config.ts              # Prisma config (datasource URL, schema path)
│   ├── migrations/                   # Auto-generated SQL migration files
│   └── seed.ts                       # Seeds: admin user, stories, sentence patterns, video lessons
│
├── docker-compose.yml                # PostgreSQL (port 5433) & Redis containers
├── Dockerfile                        # Multi-stage production build
└── package.json
```

---

## 3. Database Schema (Prisma ORM & PostgreSQL)

The schema defines learning paths, story translation structures, bookmarks (with SM-2 spaced repetition), streaks, payment records, practice features, and video lessons. Below is a summary of every model in the current schema.


### Enums

| Enum | Values |
|------|--------|
| `LearningPath` | `KIDS`, `SPOKEN`, `IELTS`, `ADMISSION`, `JOB`, `VOCAB` |
| `PaymentGateway` | `BKASH`, `NAGAD`, `STRIPE`, `PLAY_STORE`, `APP_STORE` |
| `SubscriptionStatus` | `ACTIVE`, `EXPIRED`, `CANCELLED`, `PENDING` |

### Models Overview

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| `User` | id, email, phone, passwordHash, name, role, learningPath, xpTotal, gems, lives, league, nctbClass | Core user account |
| `OtpRequest` | phone, code, expiresAt, verified | Phone OTP verification |
| `Story` | id, title, titleBn, description, level, learningPath, isPremium, isPublished, wordCount | English learning story units |
| `StoryPage` | storyId, pageIndex, imageUrl | Individual pages within a story |
| `Sentence` | pageId, sentenceIdx, englishText, banglaText, startTime, endTime | Audio-synced bilingual sentences |
| `WordToken` | sentenceId, english, bangla, sentenceContext, pronunciationG | Tappable vocabulary tokens |
| `Bookmark` | userId, wordTokenId, englishWord, banglaMeaning, nextReviewAt, interval, easeFactor, repetitions, isLearned | Vocabulary bookmarks with **SM-2 spaced repetition** |
| `FlashcardReview` | userId, word, quality (0-5), reviewedAt | SM-2 review quality history |
| `UserProgress` | userId, storyId, completed, score, xpEarned | Story completion tracking |
| `Streak` | userId, currentStreak, longestStreak, lastActiveDate | Daily learning streak |
| `DailyGoal` | userId, date, targetXp, earnedXp, completed | Daily XP goal tracking |
| `LeaderboardEntry` | userId, league, weekStarting, xpEarned | Weekly XP for league rankings |
| `UserItem` | userId, itemType (STREAK_FREEZE, AVATAR_OUTFIT), quantity | Virtual shop inventory |
| `Subscription` | userId, gateway, status, planType, expiryDate, seatCount | Premium subscription records |
| `PaymentTransaction` | userId, gateway, transactionId, amount, currency, status | Payment audit log |
| `Referral` | referrerId, refereeId, status, rewardGranted | Referral tracking |
| `B2BOrganization` | name, type, licenseCount, adminId | School/tutorial center accounts |
| `FriendChallenge` | senderId, receiverId, storyId, senderScore, receiverScore, status | PvP story score challenges |
| `StudyGroup` | name, inviteCode, maxSize | Group study feature |
| `StudyGroupMember` | groupId, userId, weeklyXp | Group membership |
| `SentencePattern` | pattern, patternBn, exampleEn, exampleBn, category | Spoken English templates ✨ |
| `UserMistake` | userId, type (WORD\|SENTENCE), englishText, banglaText, incorrectCount, corrected | Auto-logged quiz mistakes ✨ |
| `VideoLesson` | id, title, titleBn, youtubeId, thumbnailUrl, durationSeconds, learningPath, level, isPremium | YouTube-embedded video lessons ✨ NEW |
| `VideoProgress` | userId, videoId, watchedSeconds, completed, xpEarned | Video watch tracking ✨ NEW |

> ✨ = Added in Practice Hub / Video expansion (not in original architecture doc)


---

## 4. REST API Endpoint Specifications

> All routes are prefixed with `/api`. JWT Bearer token is required on all routes unless marked 🔓.

### 4.1 Authentication (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST 🔓 | `/auth/register` | Register with name, phone, password, learningPath, nctbClass |
| POST 🔓 | `/auth/login` | Email or phone + password login → JWT |
| POST 🔓 | `/auth/login/phone` | Send OTP to phone number |
| POST 🔓 | `/auth/login/phone/verify` | Verify OTP → JWT |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/me` | Update profile (name, avatar, learningPath) |

### 4.2 Stories (`/api/stories`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stories` | Paginated list (filtered by path, level). Enforces free tier 40-story paywall |
| GET | `/stories/:id` | Full story with sentences, word tokens, audio timestamps |
| GET | `/stories/:id/quiz` | Generate quiz questions from story sentences |

### 4.3 Progress & Practice (`/api/progress`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/progress/complete` | Mark story complete, award XP |
| GET | `/progress/bookmarks` | Get all bookmarks with SM-2 due dates |
| POST | `/progress/bookmarks` | Add a word bookmark (with SM-2 fields) |
| DELETE | `/progress/bookmarks/:word` | Remove bookmark |
| POST | `/progress/bookmarks/review` | Submit SM-2 review rating for a flashcard |
| GET | `/progress/bookmarks/due` | Get bookmarks due for review today |
| GET | `/progress/learned` | Get all words marked as fully learned |
| GET | `/progress/mistakes` | Get all user mistake records |
| PATCH | `/progress/mistakes/:id/corrected` | Mark a mistake as corrected |
| GET | `/progress/sentence-patterns` | Get spoken English sentence patterns |

### 4.4 Quiz (`/api/quiz`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/quiz/submit` | Submit quiz answers; auto-logs incorrect answers to `UserMistake` |

### 4.5 Gamification (`/api/gamification`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/gamification/xp/add` | Award XP; updates league, level, daily goal |
| GET | `/gamification/streak` | Current & longest streak, last active date |
| POST | `/gamification/streak/checkin` | Daily check-in to extend streak |
| GET | `/gamification/leaderboard` | Top 30 users in current user's league (weekly XP) |
| GET | `/gamification/daily-goal` | Today's XP target and progress |
| GET | `/gamification/milestones` | All milestone achievements unlocked by user |

### 4.6 Shop (`/api/shop`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/shop/items` | All purchasable shop items |
| POST | `/shop/buy` | Purchase item with Gems (Streak Freeze, Lives, Avatar) |
| POST | `/shop/refill-lives` | Refill lives (ad-gated or gem-based) |

### 4.7 Payment (`/api/payment`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/payment/bkash/create` | Init bKash tokenized checkout session |
| POST | `/payment/bkash/callback` | bKash S2S callback → execute & confirm payment |
| POST | `/payment/nagad/create` | Init Nagad checkout with signature |
| POST | `/payment/nagad/callback` | Nagad callback → verify signature, confirm |
| POST | `/payment/revenuecat-webhook` | RevenueCat IAP webhook (App Store / Play Store) |
| GET | `/payment/subscriptions/plans` | List subscription tiers with BDT pricing |
| GET | `/payment/subscriptions/me` | Current user's active subscription details |

### 4.8 Accounts / Parental Control (`/api/accounts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts/children` | List linked child accounts |
| POST | `/accounts/children` | Link a child account |
| GET | `/accounts/children/:id/progress` | Child's story progress & XP |
| GET | `/accounts/invitations` | Pending B2B org invitations |
| POST | `/accounts/invitations/accept` | Accept a B2B organization invite |

### 4.9 Growth & Referrals (`/api/growth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/growth/referral/invite` | Generate personal deep-link referral URL |
| POST | `/growth/referral/redeem` | Apply a referral code → grant 7-day Premium to both |
| POST | `/growth/share-card` | Generate shareable score card image URL |

### 4.10 Video Learning (`/api/video`) ✨ NEW
| Method | Path | Description |
|--------|------|-------------|
| GET | `/video` | Paginated list of published video lessons (filter by path, level) |
| GET | `/video/:id` | Single video lesson details |
| GET | `/video/my-progress` | Current user's video watch history |
| POST | `/video/progress` | Track watch progress; awards 15 XP on first completion |

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
