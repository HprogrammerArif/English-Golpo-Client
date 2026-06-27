import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, TextInput, Linking, Clipboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGetReferralLinkQuery, useRedeemReferralMutation } from "@/redux/api/growthApi";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function ReferralScreen() {
  const router = useRouter();

  const { data: referral, isLoading, error, refetch } = useGetReferralLinkQuery();
  const [redeemCode, { isLoading: isRedeeming }] = useRedeemReferralMutation();

  const [inputCode, setInputCode] = useState("");

  const handleShareWhatsApp = () => {
    if (!referral?.shareMessage) return;
    const url = `whatsapp://send?text=${encodeURIComponent(referral.shareMessage)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web link or alert
          Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(referral.shareMessage)}`);
        }
      })
      .catch((err) => console.error("An error occurred opening WhatsApp", err));
  };

  const handleCopyCode = () => {
    if (!referral?.code) return;
    Clipboard.setString(referral.code);
    Toast.show({
      type: "success",
      text1: "Copied to Clipboard! 📋",
      text2: `Referral code: ${referral.code}`,
    });
  };

  const handleRedeem = async () => {
    if (!inputCode.trim()) {
      Toast.show({
        type: "error",
        text1: "Referral code required",
      });
      return;
    }

    try {
      const response = await redeemCode({ code: inputCode.toUpperCase().trim() }).unwrap();
      Toast.show({
        type: "success",
        text1: "Referral Redeemed! 🎉",
        text2: `Awarded ${response.rewardDays} days of Premium. Thank ${response.referrerName}!`,
      });
      setInputCode("");
    } catch (err: any) {
      console.error("Redemption failed:", err);
      Toast.show({
        type: "error",
        text1: "Redeem Failed",
        text2: err?.data?.message || "Invalid or already used referral code.",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-500 font-semibold mt-4">Opening Referrals...</Text>
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
        <Text className="text-lg font-black text-gray-800">Invite & Earn</Text>
        <View className="w-8" />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Referral Card */}
        <View className="bg-pink-500 rounded-3xl p-6 mb-6 shadow-md shadow-pink-500/10 items-center">
          <Text className="text-4xl mb-3">🎁</Text>
          <Text className="text-xl font-extrabold text-white text-center">Share the Gift of English</Text>
          <Text className="text-xs text-pink-100 text-center mt-2 leading-relaxed px-4">
            Invite your friends to learn with English Golpo! For every friend who signs up with your code, you both get 7 days of Premium access free!
          </Text>

          <View className="border-t border-pink-400/40 w-full my-5" />

          {error ? (
            <Text className="text-white text-xs font-bold">Failed to load referral code.</Text>
          ) : (
            <View className="w-full flex-row space-x-3">
              <View className="flex-1 bg-white/10 border border-white/20 h-12 rounded-2xl justify-center items-center">
                <Text className="text-white font-extrabold text-base tracking-widest">
                  {referral?.code}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCopyCode}
                className="bg-white px-5 h-12 rounded-2xl justify-center items-center active:bg-gray-50"
              >
                <Text className="text-pink-600 font-extrabold text-sm">Copy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Button for Sharing */}
        <TouchableOpacity
          onPress={handleShareWhatsApp}
          disabled={!referral}
          className="w-full bg-emerald-500 py-4 rounded-2xl items-center justify-center shadow flex-row space-x-2 active:bg-emerald-600 mb-6"
        >
          <Ionicons name="logo-whatsapp" size={20} color="white" />
          <Text className="text-white font-extrabold text-base">Invite via WhatsApp</Text>
        </TouchableOpacity>

        {/* Redeem Referral Code Form */}
        <View className="bg-white border border-gray-100 p-5 rounded-3xl mb-6 shadow-sm">
          <Text className="text-[15px] font-black text-gray-800 mb-1">Enter Invite Code</Text>
          <Text className="text-xs font-semibold text-gray-400 mb-4">
            Did a friend invite you? Enter their referral code here to claim your reward.
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 flex-row items-center gap-2">
              <Ionicons name="gift-outline" size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-sm font-semibold text-gray-800 uppercase tracking-widest"
                placeholder="Enter Code"
                placeholderTextColor="#9CA3AF"
                value={inputCode}
                onChangeText={setInputCode}
                autoCapitalize="characters"
              />
            </View>
            
            <TouchableOpacity
              onPress={handleRedeem}
              disabled={isRedeeming}
              className="bg-pink-500 px-5 rounded-2xl justify-center items-center active:bg-pink-600"
            >
              {isRedeeming ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-extrabold text-sm">Redeem</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
});
