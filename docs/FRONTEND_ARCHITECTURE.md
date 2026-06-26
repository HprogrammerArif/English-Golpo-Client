# English Golpo - Frontend Mobile Architecture Specification
**Technology Stack**: React Native (Expo SDK 56) • TypeScript • Redux Toolkit (with Redux Persist) • RTK Query • NativeWind v4 (Tailwind) • RevenueCat

---

## 1. Architectural Introduction & Philosophy

`English Golpo` is designed to be a highly persuasive, gamified, story-centric language learning application tailored specifically for Bengali speakers. The frontend relies on **Clean Architecture** combined with a **Feature-Based Modular Structure** to ensure maintainability, testability, and speed as the project scales.

### Core Architectural Principles
*   **Separation of Concerns (SoC)**: UI presentation, domain logic (state management), and data fetching (API client/offline storage) are strictly decoupled.
*   **Offline-First Strategy**: Stories, vocabulary, audio transcripts, and user progress are stored locally to accommodate low-bandwidth and unstable network connections typical in regional parts of Bangladesh.
*   **Predictable State Flow**: Single source of truth (Redux Store) with RTK Query managing server-synchronized caching, and local slices managing UI state, current story playheads, and gamification tracking.
*   **Performance & Rendering Efficiency**: Large list items, custom canvas renderings (e.g., illustrated stories), and high-frequency animations (streaks, XP gains) are optimized utilizing `flash-list` and `react-native-reanimated`.

---

## 2. Feature-Based Folder Structure

The project maps all domains to specific modules. Here is the structure designed to organize feature modules:

```
src/
├── app/                             # EXPO ROUTER (File-Based Navigation)
│   ├── _layout.tsx                  # App entry point (Providers, Splash, Fonts, Sentry)
│   ├── (auth)/                      # Unauthenticated Access Group
│   │   ├── welcome.tsx              # Welcome & Language onboarding screen
│   │   ├── placement-test.tsx       # Dynamic Quiz assessing user's level (Sunk-cost builder)
│   │   ├── login.tsx                # Phone OTP / Email Login
│   │   ├── register.tsx             # User Sign Up (Age, Learning Path preference)
│   │   └── forgot-password.tsx      # Password recovery
│   └── (app)/                       # Authenticated Guarded Group
│       ├── _layout.tsx              # Tabs and auth redirect gate
│       ├── (tabs)/                  # Main Navigation Tabs
│       │   ├── index.tsx            # Home Tab (Dashboard: Goals, Streaks, Paths)
│       │   ├── explore.tsx          # Stories Tab (Learning paths, categorized books)
│       │   ├── leaderboard.tsx      # Leagues & Leaderboard Rankings
│       │   ├── profile.tsx          # Profile & Gamification Stats (XP, Badges)
│       │   └── notifications.tsx    # Notifications Tab
│       ├── paths/                   # Learning Path Selection screen
│       ├── shop/
│       │   └── index.tsx            # Virtual Currency Store (Gems, Lives, Streak Freezes)
│       ├── parents/
│       │   └── dashboard.tsx        # Parental Control & Progress Dashboard
│       ├── growth/
│       │   ├── refer.tsx            # Referral Dashboard (Invite friends, get Premium)
│       │   └── review-prompt.tsx    # In-App App Store Rating Interceptor
│       ├── stories/
│       │   ├── [storyId].tsx        # Interactive Story Reader (Side-by-side translation)
│       │   └── download-manager.tsx # Offline Downloads dashboard
│       ├── quiz/
│       │   └── [lessonId].tsx       # Interactive Lesson Quiz Screen
│       └── subscription/
│           └── paywall.tsx          # Subscriptions (bKash, Nagad, IAP details)
│
├── components/                      # Global Reusable UI Components
│   ├── ui/                          # Atom components (Buttons, Inputs, Badges)
│   ├── story/                       # Story Reader components (AudioPlayer, TapText)
│   ├── quiz/                        # Quiz card views (MCQ, PronunciationCheck, MatchCard)
│   ├── gamification/                # StreakFlame, XPCard, DailyGoalIndicator
│   └── payment/                     # PaymentOptions, CustomWebViewBridge
│
├── constants/
│   ├── index.ts                     # Configuration, App Keys, API paths
│   └── theme.ts                     # Colors, Spacing, Typography tokens
│
├── hooks/                           # Shared Custom Hooks
│   ├── useAudioSync.ts              # Syncs audio timestamps to highlighted text
│   ├── useSpeechToText.ts           # Speech analysis wrapper for pronunciation
│   ├── useTheme.ts                  # Dark/light mode dynamic hooks
│   └── useRevenueCat.ts             # IAP logic wrapper
│
├── lib/                             # External SDK initializations
│   ├── sentry.ts                    # Sentry config
│   └── revenuecat.ts                # RevenueCat init
│
├── services/                        # Native integrations & APIs
│   ├── audioService.ts              # Expo-AV wrapper for audio narration
│   └── offlineStorage.ts            # Expo-FileSystem downloader & caching manager
│
└── types/                           # TypeScript interfaces
    ├── story.ts                     # Stories, sentences, translations, timestamps
    ├── user.ts                      # User Profile, Streaks, XP, subscription tier
    └── quiz.ts                      # Question structures
```

---

## 3. Design System & Theme Configuration (NativeWind v4)

Our color palette is curated to appeal to children (vibrant, welcoming) and professional learners (sleek, high-contrast, premium). 

### `tailwind.config.js`
Custom styles tailwind setup:
```javascript
const { hairlineWidth } = require('nativewind/theme');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#10B981', // Emerald green (English Golpo main identity)
          light: '#34D399',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#F59E0B', // Warm Amber (XP, Streaks, Achievements)
          light: '#FBBF24',
          dark: '#D97706',
        },
        brandRed: '#EF4444', // Nagad & Alerts
        brandBlue: '#2563EB', // Stripe & General
        brandPink: '#E11D48', // bKash
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        bold: ['Inter-Bold'],
        bangla: ['SolaimanLipi'], // Essential for Bengali font metrics
      },
    },
  },
  plugins: [],
};
```

### CSS Variable Mapping (`global.css`)
```css
@theme {
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  --card: 0 0% 100%;
  --border: 220 13% 91%;
  --muted: 220 14.3% 95.9%;
  --muted-foreground: 220 8.9% 46.1%;
}

.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  --card: 224 71.4% 4.1%;
  --border: 217.2 32.6% 17.5%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
}
```

---

## 4. State Management Specifications (Redux & RTK Query)

### Redux Slices

We model user session, progress tracking, and offline data queue natively in Redux.

#### A. User & Authentication Slice (`redux/features/auth/authSlice.ts`)
Tracks tokens, active subscriptions, and profile identifiers.
```typescript
interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'free' | 'premium';
    learningPath: 'KIDS' | 'SPOKEN' | 'IELTS' | 'ADMISSION' | 'JOB' | 'VOCAB' | null;
  } | null;
}
```

#### B. Gamification & Streak Slice (`redux/features/gamification/gameSlice.ts`)
Maintains dynamic stats such as active streak, XP earned today, levels, completed daily challenges, lives, and virtual currency.
```typescript
interface GameState {
  streak: number;
  lastActiveDate: string | null; // ISO Date String
  xpPoints: number;
  level: number;
  lives: number; // Max 5, regenerates over time
  gems: number; // Earned by completing lessons, used in shop
  league: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  dailyGoalXp: number; // e.g. 50 XP
  dailyXpEarned: number;
  achievements: { id: string; unlockedAt: string }[];
}
```

#### C. User Progress & Bookmark Slice (`redux/features/progress/progressSlice.ts`)
Tracks finished lessons, unlocked levels, bookmarked vocabulary, and custom user flashcards.
```typescript
interface Bookmark {
  id: string;
  word: string;
  meaning: string;
  contextSentence: string;
  storyId: string;
  savedAt: string;
}

interface ProgressState {
  completedLessons: string[]; // List of lesson IDs
  unlockedLevels: string[]; // List of level IDs
  bookmarks: Bookmark[];
  storyProgress: Record<string, { currentPageIndex: number; isCompleted: boolean }>;
}
```

---

## 5. Core Interactive React Native Component Specifications

### 5.1 `StoryReader` Component
Provides Beelinguapp/LingQ style interface: synchronized audio playback, side-by-side Bangla/English view, and clickable vocabulary tags.

*File Reference:* `src/components/story/StoryReader.tsx`

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { useAppDispatch } from '@/redux/hooks';
import { addBookmark } from '@/redux/features/progress/progressSlice';
import { Story, WordToken } from '@/types/story';

interface StoryReaderProps {
  story: Story;
  audioUrl: string;
  timestampMapping: { start: number; end: number; sentenceIndex: number }[];
}

export const StoryReader: React.FC<StoryReaderProps> = ({ story, audioUrl, timestampMapping }) => {
  const dispatch = useAppDispatch();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMillis, setPlaybackMillis] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [selectedWord, setSelectedWord] = useState<WordToken | null>(null);

  // Load and configure audio
  useEffect(() => {
    let isMounted = true;
    const loadAudio = async () => {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      if (isMounted) setSound(newSound);
    };

    loadAudio();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUrl]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackMillis(status.positionMillis);
      setIsPlaying(status.isPlaying);
      
      // Calculate highlighted sentence based on playback millisecond mapping
      const currentSec = status.positionMillis / 1000;
      const matchingSentence = timestampMapping.find(
        (t) => currentSec >= t.start && currentSec <= t.end
      );
      if (matchingSentence) {
        setActiveSentenceIndex(matchingSentence.sentenceIndex);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleWordTap = (word: WordToken) => {
    setSelectedWord(word);
    // Auto speak the individual word on tap (ELSA speak light feature)
    // Optional: Add local TextToSpeech trigger
  };

  const handleBookmark = () => {
    if (selectedWord) {
      dispatch(addBookmark({
        id: Math.random().toString(),
        word: selectedWord.english,
        meaning: selectedWord.bangla,
        contextSentence: selectedWord.sentenceContext,
        storyId: story.id,
        savedAt: new Date().toISOString()
      }));
      setSelectedWord(null);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      {/* Top Graphic Illustration */}
      <Image 
        source={story.pages[0].imageUrl} 
        className="w-full h-48 rounded-2xl mb-4" 
        contentFit="cover"
        transition={300}
      />

      <ScrollView className="flex-1 mb-4">
        {story.pages[0].sentences.map((sentence, sIdx) => {
          const isHighlighted = activeSentenceIndex === sIdx;
          return (
            <View 
              key={sIdx} 
              className={`p-3 rounded-lg mb-2 transition-all ${
                isHighlighted ? 'bg-primary-light/20 border-l-4 border-primary' : 'bg-transparent'
              }`}
            >
              {/* Tappable English Word Token Row */}
              <View className="flex-row flex-wrap mb-1">
                {sentence.tokens.map((token, tIdx) => (
                  <TouchableOpacity key={tIdx} onPress={() => handleWordTap(token)}>
                    <Text className="text-lg font-sans text-foreground mr-1.5 underline decoration-primary/30">
                      {token.english}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bangla Translation */}
              <Text className="text-sm font-bangla text-muted-foreground mt-1">
                {sentence.bangla}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Word Translation Popover */}
      {selectedWord && (
        <View className="absolute bottom-24 left-4 right-4 bg-card border border-border p-4 rounded-2xl shadow-xl">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-primary">{selectedWord.english}</Text>
            <TouchableOpacity onPress={handleBookmark} className="bg-primary/10 px-3 py-1.5 rounded-full">
              <Text className="text-xs text-primary font-bold">🔖 Bookmark</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-base font-bangla text-foreground mb-1">অর্থ: {selectedWord.bangla}</Text>
          <Text className="text-xs text-muted-foreground italic">"{selectedWord.sentenceContext}"</Text>
        </View>
      )}

      {/* Audio Controller Bar */}
      <View className="flex-row items-center justify-around bg-muted p-4 rounded-full border border-border shadow-md">
        <TouchableOpacity onPress={handlePlayPause} className="bg-primary p-3 rounded-full w-14 h-14 items-center justify-center">
          <Text className="text-white text-lg font-bold">{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

---

### 5.2 `PronunciationGuide` Component
ELSA Speak style functionality: allows students/kids to speak a specific vocabulary word or story sentence and provides phonetic matching. Integrates standard `expo-av` audio recording and pushes it to backend pronunciation check endpoint.

*File Reference:* `src/components/story/PronunciationGuide.tsx`

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentToken } from '@/redux/features/auth/authSlice';

interface PronunciationGuideProps {
  phrase: string;
  onAssessmentResult: (score: number, feedback: string) => void;
}

export const PronunciationGuide: React.FC<PronunciationGuideProps> = ({ phrase, onAssessmentResult }) => {
  const token = useAppSelector(selectCurrentToken);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setIsAnalyzing(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        await uploadAudio(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setIsAnalyzing(false);
      setRecording(null);
    }
  };

  const uploadAudio = async (localUri: string) => {
    try {
      const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/pronunciation/evaluate`;
      
      const response = await FileSystem.uploadAsync(uploadUrl, localUri, {
        fieldName: 'audio',
        httpMethod: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        parameters: { phrase },
      });

      const result = JSON.parse(response.body);
      onAssessmentResult(result.score, result.feedback);
    } catch (e) {
      console.error('Error uploading speech assessment', e);
    }
  };

  return (
    <View className="p-5 bg-card border border-border rounded-3xl items-center">
      <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Speak this phrase</Text>
      <Text className="text-2xl font-bold text-foreground text-center mb-6">"{phrase}"</Text>

      {isAnalyzing ? (
        <ActivityIndicator size="large" color="#10B981" />
      ) : (
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={stopRecording}
          className={`w-20 h-20 rounded-full items-center justify-center border-4 ${
            isRecording ? 'bg-red-500 border-red-200 animate-pulse' : 'bg-primary border-primary-light'
          }`}
        >
          <Text className="text-white text-3xl">{isRecording ? '🎙️' : '🎤'}</Text>
        </TouchableOpacity>
      )}
      <Text className="text-xs text-muted-foreground mt-3">
        {isRecording ? 'Release to evaluate' : 'Hold to speak'}
      </Text>
    </View>
  );
};
```

---

## 6. Offline Download Strategy
To construct offline capabilities, the frontend coordinates an internal asset queue using `expo-file-system`.

1. **Database Persistence**: Keep story metadata, sentences, and vocabulary tokens inside SQLite (`expo-sqlite`) or high-performance MMKV storage.
2. **Media Assets Storage**: Download story illustration images and high-fidelity audio voiceovers locally to the app data directories:
   *   `FileSystem.documentDirectory + 'stories/${storyId}/audio.mp3'`
   *   `FileSystem.documentDirectory + 'stories/${storyId}/page_${index}.jpg'`
3. **Synchronization Queue**: On network retrieval, check for incomplete offline sync profiles and update the local database payload.

---

## 7. Advanced Monetization & Engagement Features (Profitability Core)

To maximize revenue and user retention, the application employs multiple proven engagement loops seen in top-grossing language apps.

### 7.1 Hearts/Lives System
*   **Mechanic**: Free users have a maximum of 5 "Lives". Making a mistake in a quiz or pronunciation check consumes a life.
*   **Regeneration**: 1 life regenerates every 4 hours.
*   **Monetization**: Users can watch a Rewarded Ad to gain a life, spend **Gems** to refill lives, or subscribe to **Premium** for Infinite Lives.

### 7.2 Virtual Currency (Gems) & The Shop
*   **Mechanic**: Users earn Gems by completing daily goals, advancing leagues, and maintaining streaks.
*   **Shop Offerings**: Gems can be spent to buy:
    *   **Streak Freezes**: Protects the streak if the user misses a day (highly effective retention tool).
    *   **Avatar Outfits**: Cosmetic items for their profile (appeals strongly to kids).
    *   **Bonus Lessons**: Unlock special idiom or slang modules.
*   **Monetization**: Users can buy Gem packs using real money via App Store / Google Play / local gateways.

### 7.3 Leaderboards & Leagues
*   **Mechanic**: Users are placed in cohorts of 30 users. Earning XP moves them up the leaderboard.
*   **Leagues**: Bronze ➔ Silver ➔ Gold ➔ Platinum ➔ Diamond. Top 7 advance, bottom 7 demote weekly.
*   **Psychology**: Fosters intense competition and FOMO, massively increasing session lengths.

### 7.4 AdMob Integration (Free Tier Monetization)
For users who do not purchase subscriptions, the app monetizes their engagement via `react-native-google-mobile-ads`:
*   **Banner Ads**: Displayed at the bottom of the Explore and Leaderboard tabs.
*   **Interstitial Ads**: Shown occasionally after completing a story or lesson.
*   **Rewarded Video Ads**: "Watch an ad to double your XP!" or "Watch an ad to refill your life!"

### 7.5 Parental Dashboard (B2C Focus for Kids)
*   Parents are the actual buyers for the "Kids English" path. 
*   **Features**: A PIN-protected dashboard where parents can view their child's weekly XP, lessons completed, and time spent learning.
*   **Upsell**: Push notifications target the parents: *"Rafi learned 20 new words this week! Upgrade to Premium to unlock Advanced Phonics."*

### 7.6 Onboarding "Commitment" Paywall & Placement Test
*   **Mechanic**: Before letting the user explore the app, they undergo a "Placement Test" to gauge their English level. 
*   **Psychology**: This builds immediate investment (the "Sunk Cost Fallacy"). Upon completing the test, they are shown a highly optimized Paywall offering a "Customized Learning Plan" (Blinkist / Duolingo strategy).
*   **Outcome**: Significantly increases Day-0 free-to-paid conversion rates.

### 7.7 Viral Growth: The Referral Engine
*   **Mechanic**: "Give a week, Get a week". Users can share a unique deep-link via WhatsApp/Messenger.
*   **Reward**: If a friend signs up, both the inviter and the invitee receive 7 Days of Premium for free. 
*   **Outcome**: Massively lowers Customer Acquisition Cost (CAC) in highly social markets like Bangladesh.

### 7.8 In-App Rating Loop
*   **Mechanic**: Native App Store/Google Play rating prompts are *only* triggered right after a high-euphoria moment (e.g., passing a hard level or achieving a 7-day streak).
*   **Outcome**: Floods the App Store with 5-star reviews, increasing Organic Search visibility.

### 7.9 Growth Analytics & A/B Testing (PostHog / Firebase)
*   Integrated Feature Flags to test pricing models (e.g., 45 BDT vs 60 BDT) dynamically without submitting app updates.
*   Funnel tracking to see exactly where users abandon the checkout flow.

---

## 8. Payments & Subscriptions Integration Architecture

The monetization system is optimized for Bangladesh by splitting logic between App-Store purchases (Google/Apple IAP via RevenueCat) and local, highly popular web-based payment APIs (bKash checkout, Nagad checkout, and Stripe international gateways).

                                Verify Transaction Status
                                            │
                                            ▼
                                  Update Redux State
```

### 7.2 Custom bKash/Nagad In-App WebView Bridge Component

Since bKash and Nagad use tokenized redirect page gateways, using a React Native Webview with strict callback interception is required.

*File Reference:* `src/components/payment/LocalPaymentBridge.tsx`

```tsx
import React, { useRef } from 'react';
import { View, SafeAreaView } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/redux/hooks';
import { baseApi } from '@/redux/api/baseApi';

interface LocalPaymentBridgeProps {
  checkoutUrl: string;
  gatewayType: 'BKASH' | 'NAGAD' | 'STRIPE';
  onSuccess: (paymentId: string) => void;
  onFailure: (errorMessage: string) => void;
}

export const LocalPaymentBridge: React.FC<LocalPaymentBridgeProps> = ({
  checkoutUrl,
  gatewayType,
  onSuccess,
  onFailure,
}) => {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();

  const handleNavigationChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Check redirect URLs configured on the backend
    if (url.includes('/api/payment/success')) {
      // Extract payment/transaction ID from redirect parameters
      const urlObj = new URL(url);
      const transactionId = urlObj.searchParams.get('transactionId') || 'unknown';
      onSuccess(transactionId);
    } else if (url.includes('/api/payment/fail') || url.includes('/api/payment/cancel')) {
      onFailure('Payment was cancelled or failed.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <WebView
        ref={webViewRef}
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
};
```

---

## 9. Localization Setup (`bangla` / `english`)

The application supports real-time switching between English instruction prompts and Bengali instructions, which is crucial for children and rural audiences.

*File Reference:* `src/constants/localization.ts`

```typescript
export const translations = {
  bn: {
    welcome: "ইংলিশ গল্পে আপনাকে স্বাগতম!",
    selectPath: "আপনার শিক্ষার পথ নির্বাচন করুন",
    kidsEnglish: "বাচ্চাদের ইংরেজি",
    spokenEnglish: "স্পোকেন ইংলিশ",
    streakCount: "{{count}} দিন লাগাতার",
    xpPoints: "{{points}} এক্সপি পয়েন্ট",
    dailyGoal: "আজকের লক্ষ্য",
    upgradeBtn: "প্রিমিয়ামে যান",
  },
  en: {
    welcome: "Welcome to English Golpo!",
    selectPath: "Select Your Learning Path",
    kidsEnglish: "Kids English",
    spokenEnglish: "Spoken English",
    streakCount: "{{count}} Day Streak",
    xpPoints: "{{points}} XP Points",
    dailyGoal: "Daily Goal",
    upgradeBtn: "Go Premium",
  }
};
```

---

## 10. EAS Deployment Configuration (`eas.json`)

To build local test-clients and generate release-ready Android App Bundles (AAB) and iOS IPAs, we configure standard EAS environments.

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "channel": "preview"
    },
    "production": {
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "app-bundle"
      },
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```
