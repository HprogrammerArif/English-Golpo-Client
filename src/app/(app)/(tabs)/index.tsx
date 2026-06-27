import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { selectDailyGoal } from "@/redux/features/gamification/gameSlice";
import { useGetStreakQuery } from "@/redux/api/gamificationApi";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { DailyGoalIndicator } from "@/components/gamification/DailyGoalIndicator";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const dailyGoal = useAppSelector(selectDailyGoal);
  const { data: streakData } = useGetStreakQuery();

  const name = user?.name || "Learner";
  const streak = streakData?.currentStreak || 0;
  const xpTotal = user?.xpTotal || 0;
  const gems = user?.gems || 0;
  const lives = user?.lives || 5;
  const isPremium = user?.role === "PREMIUM";

  const pathFriendlyNames = {
    KIDS: "Kids English (বাচ্চাদের ইংরেজি)",
    SPOKEN: "Spoken English (স্পোকেন)",
    JOB: "Job English (চাকরি প্রার্থী)",
    IELTS: "IELTS Preparation (আইইএলটিএস)",
    ADMISSION: "University Admission",
    VOCAB: "Vocabulary Mastery",
  };

  const currentPathName = user?.learningPath ? pathFriendlyNames[user.learningPath] : "Select Path";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header Bar */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center shadow-sm">
        <StreakFlame streak={streak} size="small" />

        <View className="flex-row items-center space-x-4">
          {/* Gems */}
          <View className="flex-row items-center space-x-1.5">
            <Text className="text-xl">💎</Text>
            <Text className="text-sm font-extrabold text-gray-700">{gems}</Text>
          </View>
          
          {/* Lives */}
          <View className="flex-row items-center space-x-1">
            <Ionicons name="heart" size={20} color="#EF4444" />
            <Text className="text-sm font-extrabold text-gray-700">
              {isPremium ? "∞" : lives}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} className="px-5 py-4">
        {/* Welcome Section */}
        <View className="mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">Welcome back</Text>
            <Text className="text-2xl font-black text-gray-800 mt-0.5">Hello, {name}! 👋</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push("/(app)/growth/review-prompt" as any)}
            className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100"
          >
            <Ionicons name="star" size={20} color="#F59E0B" />
          </TouchableOpacity>
        </View>

        {/* Hero Learning Path Card */}
        <View className="bg-emerald-500 rounded-3xl p-6 mb-6 shadow-md shadow-emerald-500/10">
          <TouchableOpacity
            onPress={() => router.push("/(app)/paths")}
            className="bg-emerald-600/40 self-start px-2.5 py-1 rounded-full flex-row items-center space-x-1 mb-1"
          >
            <Text className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">
              Active Learning Path
            </Text>
            <Ionicons name="pencil" size={10} color="#fff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
          
          <Text className="text-xl font-extrabold text-white mt-2 leading-tight">
            {currentPathName}
          </Text>
          <Text className="text-xs text-emerald-100 mt-2 font-medium">
            Accumulated: {xpTotal} Total XP Points
          </Text>

          <View className="border-t border-emerald-400/40 my-4" />

          <TouchableOpacity
            onPress={() => router.push("/(app)/(tabs)/explore")}
            className="bg-white h-12 rounded-2xl items-center justify-center flex-row space-x-1.5 active:bg-gray-50"
          >
            <Text className="text-emerald-700 font-extrabold text-sm">Continue Learning</Text>
            <Ionicons name="play" size={14} color="#047857" />
          </TouchableOpacity>
        </View>

        {/* Actions Grid */}
        <Text className="text-base font-extrabold text-gray-800 mb-3.5">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between gap-3 mb-6">
          {/* Shop */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/shop" as any)}
            className="bg-white border border-gray-100 rounded-2xl p-4 w-[48%] items-center justify-center flex-row space-x-2 shadow-sm"
          >
            <Text className="text-xl">🛒</Text>
            <Text className="text-sm font-bold text-gray-700">Gems Shop</Text>
          </TouchableOpacity>

          {/* Share & Invite */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/growth/refer" as any)}
            className="bg-white border border-gray-100 rounded-2xl p-4 w-[48%] items-center justify-center flex-row space-x-2 shadow-sm"
          >
            <Text className="text-xl">🎁</Text>
            <Text className="text-sm font-bold text-gray-700">Invite & Earn</Text>
          </TouchableOpacity>

          {/* Parental Control */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/parents/dashboard" as any)}
            className="bg-white border border-gray-100 rounded-2xl p-4 w-[48%] items-center justify-center flex-row space-x-2 shadow-sm"
          >
            <Text className="text-xl">👨‍👩‍👦</Text>
            <Text className="text-sm font-bold text-gray-700">Parent Mode</Text>
          </TouchableOpacity>

          {/* Go Premium */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/subscription/paywall" as any)}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 w-[48%] items-center justify-center flex-row space-x-2 shadow-sm"
          >
            <Text className="text-xl">👑</Text>
            <Text className="text-sm font-bold text-emerald-800">Go Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Goal Progress */}
        <DailyGoalIndicator xpEarnedToday={xpTotal} dailyGoal={dailyGoal} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingBottom: 40 },
});

