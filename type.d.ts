import { ImageSourcePropType } from "react-native";

export type LearningPath =
  | "KIDS"
  | "SPOKEN"
  | "IELTS"
  | "ADMISSION"
  | "JOB"
  | "VOCAB";

export type League =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "DIAMOND";

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone?: string;
  avatarUrl?: string;
  role: "FREE" | "PREMIUM" | "FAMILY_ADMIN" | "FAMILY_MEMBER";
  learningPath: LearningPath | null;
  lives: number; // For the Hearts/Lives system
  gems: number; // Virtual currency
  league: League;
  parentId?: string; // For Parental Dashboard linking
  referralCode: string; // Unique code for inviting friends
  referredBy?: string; // Who invited this user
  createdAt: string;
}

export interface WordToken {
  id: string;
  english: string;
  bangla: string;
  sentenceContext: string;
  pronunciationG?: string; // IPA format
}

export interface Sentence {
  id: string;
  sentenceIdx: number;
  englishText: string;
  banglaText: string;
  startTime: number;
  endTime: number;
  tokens: WordToken[];
}

export interface StoryPage {
  id: string;
  pageIndex: number;
  imageUrl: string;
  sentences: Sentence[];
}

export interface Story {
  id: string;
  title: string;
  description: string;
  level: number;
  learningPath: LearningPath;
  illustrationUrl: string;
  audioUrl: string;
  pages: StoryPage[];
  createdAt: string;
}

export interface Bookmark {
  id: string;
  word: string;
  meaning: string;
  contextSentence: string;
  storyId: string;
  savedAt: string;
}

export interface UserProgress {
  userId: string;
  storyId: string;
  completed: boolean;
  score: number;
  updatedAt: string;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface DailyGoal {
  userId: string;
  date: string;
  targetXp: number;
  earnedXp: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  league: League;
  rank: number;
}

export interface ParentDashboard {
  parentId: string;
  children: {
    userId: string;
    name: string;
    learningPath: LearningPath;
    dailyGoalMet: boolean;
    xpThisWeek: number;
    lastActive: string;
  }[];
  subscriptionStatus: "ACTIVE" | "INACTIVE";
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  status: "PENDING" | "COMPLETED"; // Completed when referee finishes onboarding or buys
  rewardGranted: boolean;
}

export interface B2BOrganization {
  id: string;
  name: string;
  type: "SCHOOL" | "TUTORIAL_CENTER";
  licenseCount: number;
  activeUsers: number;
  adminId: string;
}

// Custom UI Props
export interface TabBarIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomHeaderProps {
  title?: string;
}

export interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  showEye?: boolean;
  onTogglePassword?: (visible: boolean) => void;
  passwordVisible?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  textContentType?:
    | "none"
    | "emailAddress"
    | "password"
    | "username"
    | "oneTimeCode";
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface CreateUserParams {
  email?: string;
  phone?: string;
  password?: string;
  name: string;
  learningPath?: LearningPath;
}

export interface SignInParams {
  email?: string;
  phone?: string;
  password?: string;
}
