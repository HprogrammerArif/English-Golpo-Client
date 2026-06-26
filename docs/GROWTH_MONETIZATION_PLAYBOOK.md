# English Golpo — Growth & Monetization Playbook
**Region Focus**: Bangladesh 🇧🇩 · Inspired by Global SaaS Leaders

> This document outlines strategic product decisions, feature additions, and growth systems that mirror what the world's most profitable EdTech SaaS companies (Duolingo, ELSA Speak, Khan Academy, Photomath, Byju's) use to generate revenue across price-sensitive, mobile-first markets like Bangladesh. Every strategy here maps directly to the existing architecture.

---

## Table of Contents
1. [Bangladesh Market Reality Check](#1-bangladesh-market-reality-check)
2. [Pricing Architecture — Regional Tiers](#2-pricing-architecture--regional-tiers)
3. [WhatsApp as a Growth Engine](#3-whatsapp-as-a-growth-engine)
4. [Micro-Transaction & Flexible Payment System](#4-micro-transaction--flexible-payment-system)
5. [AI-Powered Personalization Layer](#5-ai-powered-personalization-layer)
6. [B2B2C — Coaching Center & School Licensing](#6-b2b2c--coaching-center--school-licensing)
7. [Smart Push Notification Engine](#7-smart-push-notification-engine)
8. [Offline-First Content Delivery](#8-offline-first-content-delivery)
9. [Social & Community Loop](#9-social--community-loop)
10. [Retention Engineering — The Habit Loop](#10-retention-engineering--the-habit-loop)
11. [Content Roadmap for Bangladesh Context](#11-content-roadmap-for-bangladesh-context)
12. [Revenue Dashboard & Analytics KPIs](#12-revenue-dashboard--analytics-kpis)

---

## 1. Bangladesh Market Reality Check

Understanding the real user is the foundation of all decisions.

### User Demographics
| Segment | Size (Estimated) | Primary Pain Point | Willingness to Pay |
|---|---|---|---|
| School kids (6–15) | ~20M smartphone users | Parents want measurable English progress | High (Parents pay, ~200–500 BDT/mo) |
| SSC/HSC students (15–18) | ~8M | Grammar + spoken for admission tests | Medium (self-pay, ~100–250 BDT/mo) |
| Job seekers / young professionals | ~10M | Spoken fluency for BPO, RMG, NGO jobs | Medium-High (~150–400 BDT/mo) |
| IELTS/TOEFL aspirants | ~1.5M | High-stakes, willing to pay premium | High (500–1500 BDT/mo) |
| Coaching center owners | ~80,000 centers | Need digital tools to retain students | Very High (B2B: 2,000–10,000 BDT/mo) |

### Infrastructure Constraints to Design Around
- **Network**: 60% of users outside Dhaka/Ctg are on 3G or spotty 4G.
- **Devices**: Median device RAM is 3–4GB. Avoid large memory footprint.
- **Payment**: ~70% of mobile internet users prefer bKash/Nagad over cards.
- **Language**: A significant portion of the target audience is more comfortable in Bangla UI.
- **Social Platform**: Facebook (not Instagram/Twitter) is the #1 referral and discovery channel.

---

## 2. Pricing Architecture — Regional Tiers

### Lesson from Global SaaS: "Purchasing Power Parity" (PPP) Pricing
Duolingo, Spotify, and Netflix all implement **PPP pricing** — charging users a price proportional to their country's purchasing power. A Duolingo Max subscription costs $14/mo in the US but is available for the equivalent of ~$3–4 in India/Bangladesh.

**Proposed Pricing Tiers:**

```
FREE TIER
  • 40 stories/lessons unlocked
  • 5 Lives (regenerates in 4 hours)
  • AdMob banner + interstitials
  • Basic vocabulary bookmarks

PREMIUM — MONTHLY  (79 BDT / ~0.65 USD)
  • Unlimited stories & lessons
  • Infinite lives + offline downloads
  • No ads + advanced streak features
  • Pronunciation AI (ELSA-like scoring)

PREMIUM — YEARLY  (599 BDT / ~5 USD, 37% savings)
  • All monthly features
  • Priority customer support
  • Early access to new content paths
  • Exclusive "Champion" badge + avatar

FAMILY PLAN  (249 BDT/mo for up to 4 profiles)
  • Premium for up to 4 linked child accounts
  • Parental dashboard with weekly PDF progress reports
  • Dedicated "Kids Safe" content filter
```

### Backend Implementation Note
The `SubscriptionStatus` and `PaymentGateway` enums in `prisma/schema.prisma` already support this. Add a `planType` field:

```prisma
model Subscription {
  // ...existing fields
  planType   String  @default("MONTHLY") // MONTHLY, YEARLY, FAMILY, B2B
  seatCount  Int     @default(1)          // For Family/B2B plans
}
```

---

## 3. WhatsApp as a Growth Engine

### Why This Matters for Bangladesh
WhatsApp has **45M+ active users** in Bangladesh with ~90% message open rates. The highest-grossing edtech apps in India (Byju's, Unacademy) built their initial 100k user bases almost entirely through WhatsApp groups.

### Feature: "WhatsApp Study Buddy" Sharing

**User Flow:**
1. User completes a story → sees a **Share** screen showing their score card.
2. Score card is a **dynamically generated image** (using `react-native-view-shot` + Cloudinary):
   - Shows username, story name, score, and streak.
   - Branded with "English Golpo" logo + QR code deep link to that story.
3. One tap → opens WhatsApp with pre-filled message + image.

**Backend API needed** (`/api/growth/share-card`):
```typescript
// Generates a shareable score card image URL
@Post('share-card')
async generateShareCard(@Req() req, @Body() body: { storyId: string; score: number }) {
  const user = req.user;
  const story = await this.storyService.findById(body.storyId);

  // Use Cloudinary transformations or a Canvas/Puppeteer microservice to generate image
  const cardUrl = await this.growthService.generateScoreCard({
    userName: user.name,
    storyTitle: story.title,
    score: body.score,
    streakDays: user.streak?.currentStreak,
    appDeepLink: `engolpo://stories/${body.storyId}`,
  });

  return { cardUrl };
}
```

### Feature: WhatsApp Reminder Bot (via Twilio / Meta WhatsApp Business API)

When a user enables it, after 48 hours of inactivity, the system sends:
> "🔥 Rafi, তোমার ৭ দিনের streak ভেঙে যাবে! আজকের একটা গল্প পড়ে নাও 👉 [Deep Link]"

**Implementation:**
- Store `whatsappOptIn: Boolean` on the `User` model.
- A NestJS **Cron Job** (using `@nestjs/schedule`) runs daily to find users with 48h inactivity and sends via the Twilio WhatsApp API.

```typescript
// In a SchedulerService
@Cron('0 9 * * *') // Every day at 9am Bangladesh time
async sendWhatsAppReminders() {
  const inactiveUsers = await this.prisma.user.findMany({
    where: {
      whatsappOptIn: true,
      streak: {
        lastActiveDate: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      }
    }
  });
  for (const user of inactiveUsers) {
    await this.twilioService.sendWhatsApp(user.phone, `...`);
  }
}
```

---

## 4. Micro-Transaction & Flexible Payment System

### Lesson from Global SaaS: "Unbundle the Subscription"
Photomath, Khan Academy, and ELSA Speak all discovered that **users who cannot commit monthly** will still pay for a specific thing they need *right now*. This unlocks a massive segment of price-sensitive users.

### New Monetization Units (Beyond Subscriptions)

| Purchase Type | Price (BDT) | What User Gets | Backend Endpoint |
|---|---|---|---|
| Single Story Pack | 9 BDT | Unlock 1 premium story permanently | `POST /api/payment/unlock-story` |
| 7-Day Booster | 29 BDT | 7 days of Premium (no ads, infinite lives) | `POST /api/payment/booster` |
| Pronunciation Session Pack | 19 BDT | 30 AI pronunciation evaluation credits | `POST /api/payment/pronunciation-credits` |
| IELTS Writing Feedback Token | 49 BDT | 1 AI-evaluated essay feedback | `POST /api/payment/writing-token` |
| Gem Pack (Large) | 99 BDT | 1000 Gems for the virtual shop | `POST /api/shop/buy-gems` |

### Prisma Schema Update for Micro-Purchases
```prisma
model ConsumablePurchase {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  type          String   // STORY_UNLOCK, BOOSTER_7DAY, PRONUNCIATION_CREDITS, WRITING_TOKEN
  quantity      Int      @default(1)
  referenceId   String?  // e.g., storyId for STORY_UNLOCK
  transactionId String   @unique
  purchasedAt   DateTime @default(now())
}
```

---

## 5. AI-Powered Personalization Layer

### Lesson from Global SaaS: "The Algorithm is the Product"
Duolingo's 2022–2024 explosive growth came from their **Birdbrain AI** that personalizes lesson difficulty, word spacing, and session length per user. Users who get a personalized experience have 3x higher 90-day retention.

### Feature: Adaptive Story Difficulty Engine

**How it works:**
1. Track per-user quiz score accuracy per story level.
2. If a user scores > 85% for 3 consecutive stories at Level 2, automatically suggest Level 3.
3. If a user scores < 50% twice in a row, surface "review" stories and easier vocabulary flashcards.

**Backend — New `AdaptiveEngine` Service:**
```typescript
// src/modules/gamification/adaptive.service.ts
@Injectable()
export class AdaptiveEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async getNextRecommendedLevel(userId: string): Promise<number> {
    const recentProgress = await this.prisma.userProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const avgScore = recentProgress.reduce((sum, p) => sum + p.score, 0) / recentProgress.length;

    if (avgScore > 85) return 1;  // Promote difficulty
    if (avgScore < 50) return -1; // Demote difficulty
    return 0;                     // Keep same
  }

  async getPersonalizedStoryQueue(userId: string): Promise<Story[]> {
    const weakWords = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
      take: 10
    });
    // Return stories that contain these weak words for spaced repetition
    // ...
  }
}
```

### Feature: Spaced Repetition Vocabulary System (Like Anki)

- All bookmarked words are automatically added to a "Review Queue."
- Every day, the app shows 10 flashcards from the queue using the **SM-2 algorithm** (same algorithm Anki uses).
- This is a massive retention driver: users come back daily because they feel they "owe" their review cards.

**New API Endpoints:**
```
GET  /api/progress/flashcard-queue    → Returns today's 10 review words
POST /api/progress/flashcard-result   → Records answer (easy/hard/forgot) to adjust next interval
```

---

## 6. B2B2C — Coaching Center & School Licensing

### Why This Matters
Bangladesh has **~80,000 coaching centers** (কোচিং সেন্টার). These are the single largest untapped B2B market. A coaching center with 50 students paying 2,000 BDT/month per license = **100,000 BDT Monthly Recurring Revenue from a single deal.**

### B2B Product Tiers

```
COACHING CENTER PLAN — from 1,500 BDT/mo
  • 25 student seats (expandable)
  • Dedicated admin dashboard with progress reports
  • Bulk SMS/WhatsApp streak reminders to all students
  • Custom branding: "Powered by [Center Name] & English Golpo"
  • Monthly PDF class report for guardians

SCHOOL / MADRASA PLAN — from 5,000 BDT/mo
  • 100–500 seats
  • Parent app integration (attendance + English score)
  • Teacher dashboard: class-wide analytics
  • Curriculum-mapped content (Class 1–10 NCTB alignment)
  • On-site training session for teachers (1x)
```

### Key Feature: NCTB-Aligned Content Track
The **National Curriculum and Textbook Board (NCTB)** publishes the official English curriculum for Bangladeshi schools (Class 1–10). Building stories and quizzes that directly map to NCTB chapters creates an **irresistible value proposition for schools** — the app becomes a homework helper, not a competitor.

### Backend — B2BOrganization Enhancements
The `B2BOrganization` model already exists. Extend it:

```prisma
model B2BOrganization {
  // ...existing fields
  customBranding   Json?      // { logoUrl, accentColor, centerName }
  nctbClassFocus   Int[]      // e.g., [6, 7, 8] = Class 6, 7, 8 focus
  contactPerson    String?
  contactPhone     String?
  contractEnd      DateTime?
  monthlyReportDay Int        @default(1) // Day of month to auto-generate PDF report
}
```

---

## 7. Smart Push Notification Engine

### Lesson from Duolingo: "The Angry Owl"
Duolingo's push notification team famously A/B tested 100s of notification copy variants. Their "Duolingo is sad 😢" notifications outperformed all others. **Emotional, personalized, behavior-triggered notifications beat scheduled blasts by 400%.**

### Notification Strategy for English Golpo

#### Category 1: Streak Protection (Highest Priority — Converts to Revenue)
```
Trigger: User has not opened app by 8 PM and has an active streak

Title: "🔥 তোমার {{streak}} দিনের Streak ভেঙে যাবে!"
Body:  "রাত ১২টার আগে একটা গল্প পড়লেই Streak বাঁচবে।"
Action: Deep link → home tab
```

#### Category 2: Parent Nudge (Drives B2C Upsells)
```
Trigger: Child user completes 5 lessons in a week

Title: "Rafi এই সপ্তাহে ৫টা Lesson শেষ করেছে! 🎉"
Body:  "Premium-এ upgrade করলে সে Phonics ও IELTS Prep পাবে।"
Action: Deep link → paywall screen
```

#### Category 3: League Danger Zone (FOMO Trigger)
```
Trigger: User is in the bottom 7 of their League with < 24h to reset

Title: "⚠️ তুমি League থেকে নামবে!"
Body:  "মাত্র ৫০ XP দরকার। এখনই একটা quiz দাও!"
Action: Deep link → quiz screen
```

#### Category 4: Social Proof (Viral Trigger)
```
Trigger: User's friend surpasses them on the leaderboard

Title: "Karim তোমাকে পেছনে ফেলে দিয়েছে!"
Body:  "তার XP এখন {{friendXP}}। তুমি কি ছেড়ে দেবে? 😤"
Action: Deep link → leaderboard screen
```

### Implementation: Notification Service Architecture
```typescript
// src/modules/notifications/notification.service.ts
@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private readonly notifQueue: Queue,
  ) {}

  async scheduleStreakProtection(userId: string, streakCount: number) {
    await this.notifQueue.add('streak-protection', { userId, streakCount }, {
      delay: this.getDelayUntil8PM(),
      jobId: `streak-${userId}-${new Date().toDateString()}`, // Idempotent
    });
  }

  private getDelayUntil8PM(): number {
    const now = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0); // 8PM Bangladesh Standard Time (UTC+6)
    if (target < now) target.setDate(target.getDate() + 1);
    return target.getTime() - now.getTime();
  }
}
```

---

## 8. Offline-First Content Delivery

### Lesson from Khan Academy: "Lite" Architecture
Khan Academy built **Khan Academy Lite** specifically for low-bandwidth markets (India, Pakistan, Bangladesh). It uses progressive downloads, text-first rendering, and local SQLite sync. This strategy 10x'd their DAU in South Asia.

### English Golpo Offline Tiers

| Asset Type | Storage Strategy | Priority |
|---|---|---|
| Story text + Bangla translations | SQLite (expo-sqlite) — always cached | P0 (immediate) |
| IPA pronunciations + word definitions | SQLite | P0 |
| Story illustration images | expo-file-system, on-demand download | P1 |
| Audio narration files (.mp3) | expo-file-system, on-demand download | P1 |
| Quiz questions | SQLite | P0 |
| Leaderboard / Social data | Network only, graceful fallback | P2 |

### "Data Saver" Mode Feature
A toggle in Settings that:
1. **Disables** automatic audio download.
2. Uses **low-resolution** images (Cloudinary transformations: `q_auto,f_auto,w_400`).
3. Substitutes audio narration with **text-to-speech** (using `expo-speech`) instead of streaming HD audio.

**Estimated data savings: ~80% per story session.**

```typescript
// In Settings screen
const [dataSaverMode, setDataSaverMode] = useMMKVBoolean('settings.dataSaver');

// In audioService.ts
export const getAudioSource = (audioUrl: string, dataSaverMode: boolean) => {
  if (dataSaverMode) {
    return null; // Will fall back to expo-speech TTS
  }
  return audioUrl;
};
```

---

## 9. Social & Community Loop

### Lesson from Duolingo: "Friends Leaderboard" = #1 Retention Feature
Duolingo found that users who had **at least one friend on the platform** had 2x the 30-day retention. Social proof, competition, and accountability are the strongest retention levers in price-sensitive markets.

### Features to Add

#### Feature: "Study Group" (Cohort of Friends)
- Users can create or join a private "Study Group" (like a friend leaderboard).
- A group has up to **10 people** sharing a private leaderboard.
- The group automatically sends a weekly WhatsApp/Push summary: "This week's champion: Karim with 890 XP!"

#### Feature: "Facebook Share" Score Card
Since **Facebook is the #1 platform in Bangladesh**, integrate direct Facebook sharing of score cards via the Facebook SDK or the native share sheet.

#### Feature: "Challenge a Friend"
- A user sends a specific story "challenge" to a friend via a deep link.
- Both complete the story within 24 hours, and their scores are compared.
- Loser must "pay" 20 Gems to the winner (virtual currency transfer).
- This creates a social, low-stakes competitive loop.

**New API Endpoints:**
```
POST /api/social/challenge/create         → Creates a challenge with a 24h expiry
POST /api/social/challenge/accept         → Accepts a received challenge
GET  /api/social/challenge/:id            → Gets challenge status and scores
POST /api/social/group/create             → Creates a study group
POST /api/social/group/join               → Joins via invite code
GET  /api/social/group/:id/leaderboard   → Gets group leaderboard
```

---

## 10. Retention Engineering — The Habit Loop

### Lesson from Behavioral Science: The "Hook Model" (Nir Eyal)
Every successful consumer app builds a **Habit Loop**:
`Trigger → Action → Variable Reward → Investment`

English Golpo's habit loop should work like this:

```
TRIGGER (External)    → Push notification / WhatsApp message
ACTION (Easy & Quick) → Opens app, reads 1 story page (< 5 min)
VARIABLE REWARD       → XP, Gems, Streak maintained, Random "BONUS XP" moments
INVESTMENT            → User's streak grows, more vocabulary bookmarked,
                        higher league standing → harder to leave
```

### "5-Minute Mode" Feature (Critical for Retention)
A significant drop-off reason in apps: users feel they "don't have enough time to do a full lesson." Solution: a **5-Minute Quick Read mode.**

- User taps a "Quick Mode" button (⚡) on the home screen.
- App surfaces a short, 1-page story or 5 vocabulary flashcards.
- Completion still awards XP and counts toward the daily streak.
- This is the #1 single feature to improve Day-7 and Day-30 retention.

### "Streak Society" — Super User Reward System
| Milestone | Reward |
|---|---|
| 7-day streak | "Weekly Warrior" badge + 50 gems |
| 30-day streak | "Monthly Master" badge + 200 gems + exclusive avatar frame |
| 100-day streak | "Century Club" badge + 7 free Premium days |
| 365-day streak | "Legend" status + lifetime 50% discount on all purchases |

---

## 11. Content Roadmap for Bangladesh Context

### Why This is a Revenue Multiplier
Content that matches **what Bangladesh users actually need** creates word-of-mouth growth. Generic English content (like "order food in a restaurant") does not resonate. Content designed for Bangladesh exam culture and job market context creates immediate, visceral value.

### Content Tracks to Prioritize

| Track | Target Audience | Revenue Potential |
|---|---|---|
| **JSC/SSC English Prep** | Class 8–10 students | Very High (parents pay well for exam prep) |
| **HSC English & Admission** | Class 11–12 | Very High (highest willingness to pay) |
| **BPO / Call Center English** | Job seekers (18–30) | High (corporate training B2B angle) |
| **IELTS Academic Word List** | University / Abroad aspirants | Highest ARPU segment |
| **English for RMG Workers** | Factory workers, supervisors | Social impact + NGO grants |
| **Kids Phonics (Class 1–5)** | Primary school kids | Very High (parents are recurring buyers) |
| **Diplomatic / BPSC English** | BCS aspirants | High (extremely motivated segment) |

### NCTB Alignment Roadmap (Critical for B2B Sales)
Map all story content to the NCTB "English For Today" textbook chapters:

```
Class 6 → Unit 1: "Meeting People"        → Story: "Rina's First Day at School"
Class 7 → Unit 3: "Bangladesh"            → Story: "The River That Feeds Us (Padma)"
Class 8 → Unit 5: "Food and Nutrition"    → Story: "Roti, Dal, and Dreams"
Class 9 → Unit 8: "Science & Technology" → Story: "The Young Inventor of Khulna"
```

This direct curriculum alignment means a teacher can assign homework from the app, which drives institutional adoption.

---

## 12. Revenue Dashboard & Analytics KPIs

### North Star Metric
> **Weekly Active Learning Users (WALU)** — Users who complete at least 3 lessons/stories in a 7-day window.

### Growth Funnel
```
INSTALL → ONBOARDING COMPLETE → PAYWALL VIEW → FREE-TO-PAID → RENEWAL
```

### Target Metrics (First Year)

| Metric | Target | Global Benchmark |
|---|---|---|
| Day-1 Retention | > 45% | Duolingo: ~50% |
| Day-7 Retention | > 20% | Duolingo: ~22% |
| Day-30 Retention | > 10% | Duolingo: ~12% |
| Free-to-Paid Conversion | > 5% | EdTech avg: 3–7% |
| Monthly Churn Rate | < 8% | SaaS average: 5–10% |
| ARPU (Average Revenue Per User) | > 120 BDT/mo | — |

### Revenue Segments to Track
- **B2C Subscriptions**: Monthly, Yearly, Family Plan MRR
- **B2B Licenses**: Organizations × seat count × price
- **Micro-Transactions**: Story unlocks, Gem packs, boosters
- **AdMob Revenue**: eCPM × impressions (free-tier baseline)

### A/B Tests to Run (via Feature Flags in PostHog / Firebase)

| Test | Hypothesis | Metric |
|---|---|---|
| Paywall placement (after lesson 3 vs. lesson 8) | Earlier paywall = higher D0 conversion | Paywall CTR, free-to-paid rate |
| Price test (79 BDT vs. 99 BDT monthly) | Price elasticity in BD market | Revenue per install |
| Streak notification copy (scary vs. motivational) | Scary copy = higher re-open rate | DAU from push |
| 5-min mode vs. standard session | Short mode = higher Day-7 retention | D7 retention cohort |
| WhatsApp share card vs. no share card | Share card = higher K-factor (virality) | Installs from sharing |

---

## Summary: What to Build First (Prioritized by ROI)

| Priority | Feature | Effort | Revenue Impact |
|---|---|---|---|
| **P0** | Micro-transactions (story unlock, 7-day booster) | Low | Very High |
| **P0** | WhatsApp streak reminder (Twilio API) | Low | Very High |
| **P0** | 5-Minute Quick Mode | Medium | Very High |
| **P1** | B2B coaching center dashboard | High | Extremely High |
| **P1** | Spaced repetition flashcard system | Medium | Very High |
| **P1** | WhatsApp score card sharing | Medium | High |
| **P1** | NCTB-aligned content tagging | Low | Extremely High |
| **P2** | Data saver mode | Low | High |
| **P2** | Friend challenge system | High | High |
| **P2** | Adaptive difficulty engine | High | Very High |
| **P3** | AI IELTS writing feedback | Very High | Extremely High (future) |

---

*Last Updated: 2026-06-26 · English Golpo Product Team*
