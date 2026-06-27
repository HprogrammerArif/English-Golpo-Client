import { ComponentProps } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useGetStreakQuery } from "@/redux/api/gamificationApi";

// ─── Path names mapper ──────────────────────────────────────────────────────
const PATH_FRIENDLY_NAMES: Record<string, string> = {
  KIDS: "Kids English (বাচ্চাদের ইংরেজি)",
  SPOKEN: "Spoken English (স্পোকেন)",
  JOB: "Job English (চাকরি প্রার্থী)",
  IELTS: "IELTS Preparation (আইইএলটিএস)",
  ADMISSION: "University Admission",
  VOCAB: "Vocabulary Mastery",
};

// ─── List item ──────────────────────────────────────────────────────────────
interface ListItemProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  iconBg?: string;
  iconColor?: string;
  rightComponent?: React.ReactNode;
  danger?: boolean;
}

function ListItem({ icon, label, onPress, iconBg = "#F3F4F6", iconColor = "#374151", rightComponent, danger }: ListItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5 gap-3.5 active:bg-gray-50"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={18} color={danger ? "#EF4444" : iconColor} />
      </View>
      <Text className={`flex-1 text-[15px] font-semibold ${danger ? "text-red-500 font-bold" : "text-gray-800"}`}>
        {label}
      </Text>
      {rightComponent ?? <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />}
    </TouchableOpacity>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { data: streakData, isLoading: isStreakLoading } = useGetStreakQuery();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const name = user?.name || "Learner";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "L";

  const isPremium = user?.role === "PREMIUM";
  const userPath = user?.learningPath ? PATH_FRIENDLY_NAMES[user.learningPath] : "Not Selected";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Profile Info */}
        <View className="items-center mb-6 mt-4">
          <View className="w-24 h-24 rounded-full bg-emerald-500 items-center justify-center shadow-md relative">
            <Text className="color-white text-3xl font-black">{initials}</Text>
            {isPremium && (
              <View className="absolute -bottom-1 -right-1 bg-yellow-400 border-2 border-white rounded-full p-1 shadow-sm">
                <Ionicons name="ribbon" size={16} color="white" />
              </View>
            )}
          </View>
          
          <Text className="text-xl font-black text-gray-800 mt-4">{name}</Text>
          <Text className="text-sm font-semibold text-gray-400 mt-1">
            {user?.phone || user?.email || "No phone linked"}
          </Text>

          {/* Membership Badge */}
          <View className="flex-row mt-3">
            <View className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${isPremium ? "bg-amber-100 border border-amber-200" : "bg-gray-100 border border-gray-200"}`}>
              <Text className="text-sm">👑</Text>
              <Text className={`text-xs font-bold uppercase tracking-wider ${isPremium ? "text-amber-800" : "text-gray-600"}`}>
                {isPremium ? "Premium Access" : "Free Account"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-3 mb-6">
          {/* XP Card */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 w-[48%] shadow-sm items-center">
            <View className="w-10 h-10 rounded-2xl bg-amber-50 items-center justify-center mb-2">
              <Ionicons name="flash" size={20} color="#F59E0B" />
            </View>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total XP</Text>
            <Text className="text-lg font-black text-gray-800 mt-0.5">{user?.xpTotal || 0}</Text>
          </View>

          {/* Gems Card */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 w-[48%] shadow-sm items-center">
            <View className="w-10 h-10 rounded-2xl bg-cyan-50 items-center justify-center mb-2">
              <Text className="text-lg">💎</Text>
            </View>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gems</Text>
            <Text className="text-lg font-black text-gray-800 mt-0.5">{user?.gems || 0}</Text>
          </View>

          {/* Streak Card */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 w-[48%] shadow-sm items-center">
            <View className="w-10 h-10 rounded-2xl bg-red-50 items-center justify-center mb-2">
              <Ionicons name="flame" size={20} color="#EF4444" />
            </View>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Streak</Text>
            <Text className="text-lg font-black text-gray-800 mt-0.5">
              {isStreakLoading ? "..." : (streakData?.currentStreak || 0)} Days
            </Text>
          </View>

          {/* League Card */}
          <View className="bg-white border border-gray-100 rounded-3xl p-4 w-[48%] shadow-sm items-center">
            <View className="w-10 h-10 rounded-2xl bg-purple-50 items-center justify-center mb-2">
              <Ionicons name="trophy" size={20} color="#8B5CF6" />
            </View>
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">League</Text>
            <Text className="text-lg font-black text-gray-800 mt-0.5 uppercase">
              {user?.league || "Bronze"}
            </Text>
          </View>
        </View>

        {/* Path Info */}
        <View className="bg-white border border-gray-100 p-5 rounded-3xl mb-6 shadow-sm">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center">
              <Ionicons name="school" size={18} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Path</Text>
              <Text className="text-[15px] font-bold text-gray-800 mt-0.5">{userPath}</Text>
            </View>
          </View>
          {user?.nctbClass && (
            <Text className="text-xs font-semibold text-gray-400 ml-12">
              Class: Class {user.nctbClass} (NCTB Primary Curriculum)
            </Text>
          )}
        </View>

        {/* Menu Actions */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 ml-4">
            Study Settings & Tools
          </Text>
          <View className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <ListItem
              icon="cart-outline"
              label="Gems Shop"
              onPress={() => router.push("/(app)/shop" as any)}
              iconBg="#EFF6FF"
              iconColor="#3B82F6"
            />
            <View style={styles.divider} />
            <ListItem
              icon="ribbon-outline"
              label="Go Premium Options"
              onPress={() => router.push("/(app)/subscription/paywall" as any)}
              iconBg="#FEFCE8"
              iconColor="#EAB308"
            />
            <View style={styles.divider} />
            <ListItem
              icon="people-outline"
              label="Parent Control Dashboard"
              onPress={() => router.push("/(app)/parents/dashboard" as any)}
              iconBg="#FFF7ED"
              iconColor="#F97316"
            />
            <View style={styles.divider} />
            <ListItem
              icon="gift-outline"
              label="Invite & Earn / Referrals"
              onPress={() => router.push("/(app)/growth/refer" as any)}
              iconBg="#FDF2F8"
              iconColor="#EC4899"
            />
            <View style={styles.divider} />
            <ListItem
              icon="download-outline"
              label="Offline Downloads"
              onPress={() => router.push("/(app)/stories/download-manager" as any)}
              iconBg="#F0FDF4"
              iconColor="#10B981"
            />
            <View style={styles.divider} />
            <ListItem
              icon="star-outline"
              label="Rate English Golpo"
              onPress={() => router.push("/(app)/growth/review-prompt" as any)}
              iconBg="#FEF3C7"
              iconColor="#F59E0B"
            />
          </View>
        </View>

        {/* Sign Out */}
        <View className="mb-8">
          <View className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <ListItem
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        <Text className="text-center text-gray-300 text-xs mb-8">Version 1.0.0 (Expo + NestJS)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 56 },
});

