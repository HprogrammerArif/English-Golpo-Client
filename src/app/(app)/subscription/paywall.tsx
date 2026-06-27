import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCreateBkashPaymentMutation } from "@/redux/api/paymentApi";
import { LocalPaymentBridge } from "@/components/payment/LocalPaymentBridge";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const PLANS = [
  {
    id: "monthly_99",
    name: "Monthly Plan",
    price: "99 BDT",
    period: "/ month",
    description: "Perfect for testing English Golpo",
    badge: null,
    color: "border-gray-100",
  },
  {
    id: "half_yearly_499",
    name: "Super Value",
    price: "499 BDT",
    period: "/ 6 months",
    description: "Highly recommended for kids & learners",
    badge: "Most Popular",
    color: "border-emerald-500 bg-emerald-50/20",
  },
  {
    id: "yearly_799",
    name: "Annual Pass",
    price: "799 BDT",
    period: "/ year",
    description: "Complete curriculum access for the year",
    badge: "Best Savings",
    color: "border-purple-500 bg-purple-50/10",
  },
];

export default function PaywallScreen() {
  const { storyId } = useLocalSearchParams<{ storyId?: string }>();
  const router = useRouter();

  const [createBkashPayment, { isLoading: isCreatingPayment }] = useCreateBkashPaymentMutation();
  const [selectedPlanId, setSelectedPlanId] = useState("half_yearly_499");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      const response = await createBkashPayment({
        planId: selectedPlanId,
        storyId: storyId,
      }).unwrap();
      
      if (response?.bkashURL) {
        setCheckoutUrl(response.bkashURL);
      } else {
        Toast.show({
          type: "error",
          text1: "Error generating checkout URL.",
        });
      }
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: err?.data?.message || "Could not connect to bKash gateway.",
      });
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setCheckoutUrl(null);
    Toast.show({
      type: "success",
      text1: "Payment Successful! 🎉",
      text2: `Transaction: ${transactionId}. Premium activated.`,
    });
    router.replace("/(app)/(tabs)");
  };

  const handlePaymentFailure = (errorMessage: string) => {
    setCheckoutUrl(null);
    Toast.show({
      type: "error",
      text1: "Payment Incomplete",
      text2: errorMessage,
    });
  };

  if (checkoutUrl) {
    return (
      <View style={styles.absoluteContainer}>
        {/* WebView payment header */}
        <SafeAreaView className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => setCheckoutUrl(null)} className="p-2 mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-gray-800">bKash Checkout</Text>
        </SafeAreaView>
        <LocalPaymentBridge
          checkoutUrl={checkoutUrl}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} className="flex-1">
      {/* Header bar */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-800">Go Premium</Text>
        <View className="w-8" />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Pitch section */}
        <View className="items-center mb-8">
          <Text className="text-4xl mb-3">👑</Text>
          <Text className="text-2xl font-black text-gray-800 text-center">Unlock Premium English Golpo</Text>
          <Text className="text-sm font-semibold text-gray-400 text-center mt-2 px-4">
            Gain unlimited access to kids stories, pronunciation assessments, interactive quizzes, and league rankings!
          </Text>
        </View>

        {/* Benefits list */}
        <View className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl mb-8 space-y-3.5">
          <View className="flex-row items-center space-x-3">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm font-bold text-gray-700 flex-1">Unlimited audio stories & vocabulary translations</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm font-bold text-gray-700 flex-1">AI voice pronunciation evaluation</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm font-bold text-gray-700 flex-1">Ad-free learning & infinite safety lives</Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm font-bold text-gray-700 flex-1">Weekly leaderboard competition participation</Text>
          </View>
        </View>

        {/* Plans selector */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5 ml-2">
          Select Subscription Plan:
        </Text>

        <View className="space-y-4 mb-8">
          {PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => setSelectedPlanId(plan.id)}
                activeOpacity={0.8}
                className={`border-2 p-5 rounded-3xl flex-row justify-between items-center relative ${plan.color} ${
                  isSelected ? "border-emerald-500 bg-emerald-500/5 shadow-sm" : "border-gray-100 bg-white"
                }`}
              >
                {plan.badge && (
                  <View className="absolute -top-3 left-6 bg-emerald-500 px-2.5 py-0.5 rounded-full shadow-sm">
                    <Text className="text-white text-[9px] font-black uppercase tracking-wider">{plan.badge}</Text>
                  </View>
                )}
                
                <View className="flex-1 pr-4">
                  <Text className="text-[17px] font-black text-gray-800">{plan.name}</Text>
                  <Text className="text-xs font-semibold text-gray-400 mt-1">{plan.description}</Text>
                </View>

                <View className="items-end">
                  <Text className="text-lg font-black text-gray-800">{plan.price}</Text>
                  <Text className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                    {plan.period}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Purchase Action */}
      <View className="bg-white border-t border-gray-100 px-6 py-4">
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={isCreatingPayment}
          className="w-full bg-emerald-500 py-4 rounded-2xl items-center justify-center shadow flex-row space-x-2.5 active:bg-emerald-600"
        >
          {isCreatingPayment ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text className="text-white font-extrabold text-base">Pay securely with bKash</Text>
              <Ionicons name="shield-checkmark" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
        <Text className="text-center text-[10px] text-gray-400 mt-2.5 font-medium">
          Payments are securely processed in BDT via standard SSL/bKash mobile gateways.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  absoluteContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, backgroundColor: "#fff" },
});
