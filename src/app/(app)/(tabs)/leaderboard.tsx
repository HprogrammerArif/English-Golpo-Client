import React from "react";
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetLeaderboardQuery } from "@/redux/api/gamificationApi";
import { Ionicons } from "@expo/vector-icons";

export default function LeaderboardScreen() {
  const { data, isLoading, error, refetch } = useGetLeaderboardQuery();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center p-6">
        <Text className="text-gray-500 font-semibold text-center mb-4">
          Failed to load leaderboard standings. Make sure you have earned some XP!
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-emerald-500 px-5 py-2.5 rounded-full"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const leagueDetails = {
    BRONZE: { name: "Bronze League", icon: "🥉", color: "text-amber-700", bg: "bg-amber-50" },
    SILVER: { name: "Silver League", icon: "🥈", color: "text-slate-400", bg: "bg-slate-50" },
    GOLD: { name: "Gold League", icon: "🥇", color: "text-yellow-500", bg: "bg-yellow-50" },
    PLATINUM: { name: "Platinum League", icon: "💎", color: "text-emerald-500", bg: "bg-emerald-50" },
    DIAMOND: { name: "Diamond League", icon: "👑", color: "text-purple-600", bg: "bg-purple-50" },
  }[data.league as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND"] || { name: "Bronze League", icon: "🥉", color: "text-amber-700", bg: "bg-amber-50" };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header league info */}
      <View className={`px-6 py-6 border-b border-gray-100 items-center ${leagueDetails.bg}`}>
        <Text className="text-4xl mb-1">{leagueDetails.icon}</Text>
        <Text className={`text-xl font-extrabold tracking-wide uppercase ${leagueDetails.color}`}>
          {leagueDetails.name}
        </Text>
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
          Week Starting: {new Date(data.weekStarting).toLocaleDateString()}
        </Text>
      </View>

      {/* Leaderboard entries */}
      <FlatList
        data={data.leaderboard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
        renderItem={({ item, index }) => {
          const rank = index + 1;
          let rankBadge = <Text className="text-gray-400 font-bold text-base w-7 text-center">{rank}</Text>;
          if (rank === 1) rankBadge = <Text className="text-[20px] w-7 text-center">🥇</Text>;
          if (rank === 2) rankBadge = <Text className="text-[20px] w-7 text-center">🥈</Text>;
          if (rank === 3) rankBadge = <Text className="text-[20px] w-7 text-center">🥉</Text>;

          return (
            <View
              className={`flex-row items-center justify-between p-4 mb-2 rounded-2xl border ${
                item.isCurrentUser
                  ? "bg-emerald-50 border-emerald-300 shadow-sm"
                  : "bg-white border-gray-100"
              }`}
            >
              <View className="flex-row items-center space-x-3.5 flex-1">
                {rankBadge}
                
                {/* Avatar */}
                <Image
                  source={{ uri: item.avatarUrl || `https://api.dicebear.com/7.x/adventurer/png?seed=${item.name}` }}
                  className="w-10 h-10 rounded-full bg-emerald-100"
                />

                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className={`text-[15px] font-bold ${
                      item.isCurrentUser ? "text-emerald-950 font-extrabold" : "text-gray-800"
                    }`}
                  >
                    {item.name}
                  </Text>
                  {item.isCurrentUser && (
                    <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                      You
                    </Text>
                  )}
                </View>
              </View>

              {/* XP score */}
              <View className="flex-row items-center space-x-1 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                <Ionicons name="flash" size={14} color="#F59E0B" />
                <Text className="text-sm font-extrabold text-gray-700">{item.xpEarned} XP</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
});
