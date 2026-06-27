import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useGetShopItemsQuery, useBuyShopItemMutation, useRefillLivesWithAdMutation } from "@/redux/api/shopApi";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const ITEM_DETAILS: Record<string, { name: string; desc: string; emoji: string; colorBg: string }> = {
  STREAK_FREEZE: {
    name: "Streak Freeze",
    desc: "Allows your streak to remain active even if you miss a day of learning.",
    emoji: "❄️",
    colorBg: "bg-blue-50",
  },
  EXTRA_LIFE: {
    name: "Extra Life",
    desc: "Refill one life so you can continue answering quiz questions.",
    emoji: "❤️",
    colorBg: "bg-red-50",
  },
  AVATAR_OUTFIT: {
    name: "Avatar Outfit",
    desc: "Unlock premium cosmetic outfits to customize your user profile badge.",
    emoji: "👕",
    colorBg: "bg-purple-50",
  },
  BONUS_LESSON: {
    name: "Bonus Lesson",
    desc: "Unlock a special premium audio story level with unique quizzes.",
    emoji: "📖",
    colorBg: "bg-amber-50",
  },
};

export default function ShopScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const { data: items, isLoading, error } = useGetShopItemsQuery();
  const [buyItem, { isLoading: isBuying }] = useBuyShopItemMutation();
  const [refillLives, { isLoading: isRefilling }] = useRefillLivesWithAdMutation();

  const gems = user?.gems || 0;
  const lives = user?.lives || 0;
  const isPremium = user?.role === "PREMIUM";

  const handleBuy = async (itemType: string) => {
    try {
      const result = await buyItem({ itemType }).unwrap();
      Toast.show({
        type: "success",
        text1: "Purchase Successful!",
        text2: `You bought a ${ITEM_DETAILS[itemType]?.name || itemType} for ${result.gemsSpent} Gems!`,
      });
    } catch (err: any) {
      console.error("Purchase failed:", err);
      Toast.show({
        type: "error",
        text1: "Purchase Failed",
        text2: err?.data?.message || "Verify if you have enough gems.",
      });
    }
  };

  const handleRefillLives = async () => {
    try {
      // In development: pass a mock adToken
      await refillLives({ adToken: "mock_ad_mob_reward_token" }).unwrap();
      Toast.show({
        type: "success",
        text1: "Lives Refilled! ❤️",
        text2: "Your lives have been reset to 5 after watching the ad.",
      });
    } catch (err: any) {
      console.error("Ad reward failed:", err);
      Toast.show({
        type: "error",
        text1: "Ad Loading Failed",
        text2: err?.data?.message || "Please try again later.",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-500 font-semibold mt-4">Opening Shop...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} className="flex-1">
      {/* Header bar */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-800">Gems Shop</Text>
        <View className="flex-row items-center space-x-1.5 bg-cyan-50 px-3 py-1.5 rounded-full">
          <Text className="text-base">💎</Text>
          <Text className="text-sm font-extrabold text-gray-700">{gems}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* User Stats Quick view */}
        <View className="bg-white border border-gray-100 p-5 rounded-3xl mb-6 shadow-sm flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Health</Text>
            <Text className="text-[17px] font-black text-gray-800 mt-0.5">
              {isPremium ? "Infinite Safety Lives ❤️" : `${lives} / 5 Lives remaining`}
            </Text>
          </View>
          {!isPremium && lives < 5 && (
            <TouchableOpacity
              onPress={handleRefillLives}
              disabled={isRefilling}
              className="bg-red-500 px-4 py-2.5 rounded-2xl flex-row items-center space-x-1 active:bg-red-600"
            >
              {isRefilling ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="play-circle" size={16} color="white" />
                  <Text className="text-white text-xs font-bold">Watch Ad</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Shop Listing */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5 ml-2">
          Available Items:
        </Text>

        {error ? (
          <View className="p-6 bg-red-50 border border-red-100 rounded-3xl items-center">
            <Text className="text-red-700 font-bold text-center">Failed to load shop items from the server.</Text>
          </View>
        ) : (
          <View className="space-y-4 mb-6">
            {items?.map((item) => {
              const details = ITEM_DETAILS[item.itemType] || {
                name: item.itemType,
                desc: "Special shop item",
                emoji: "📦",
                colorBg: "bg-gray-50",
              };
              const canAfford = gems >= item.price;

              return (
                <View
                  key={item.itemType}
                  className="bg-white border border-gray-100 p-5 rounded-3xl flex-row justify-between items-center shadow-sm"
                >
                  <View className="flex-1 pr-4 flex-row items-start space-x-4">
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center ${details.colorBg}`}>
                      <Text className="text-2xl">{details.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-black text-gray-800">{details.name}</Text>
                      <Text className="text-xs font-semibold text-gray-400 mt-1 leading-normal">
                        {details.desc}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleBuy(item.itemType)}
                    disabled={isBuying || !canAfford}
                    className={`px-4 py-2.5 rounded-2xl flex-row items-center space-x-1.5 ${
                      canAfford ? "bg-cyan-500 active:bg-cyan-600" : "bg-gray-100"
                    }`}
                  >
                    <Text className={`text-xs font-extrabold ${canAfford ? "text-white" : "text-gray-400"}`}>
                      {item.price} 💎
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
});
