import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCreateBkashPaymentMutation, useVerifyPersonalBkashPaymentMutation } from "@/redux/api/paymentApi";
import { LocalPaymentBridge } from "@/components/payment/LocalPaymentBridge";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "79 BDT",
    period: "/ month",
    description: "Perfect for testing English Golpo",
    badge: null,
    color: "border-gray-100",
  },
  {
    id: "family",
    name: "Family Pack",
    price: "249 BDT",
    period: "/ month",
    description: "Access for up to 4 family members",
    badge: "Most Popular",
    color: "border-emerald-500 bg-emerald-50/20",
  },
  {
    id: "yearly",
    name: "Annual Pass",
    price: "599 BDT",
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
  const [verifyPersonalBkash, { isLoading: isVerifyingPersonal }] = useVerifyPersonalBkashPaymentMutation();
  const [selectedPlanId, setSelectedPlanId] = useState("family");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<"AUTO" | "MANUAL">("AUTO");
  const [trxId, setTrxId] = useState("");

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

  const handleVerifyPersonal = async () => {
    if (!trxId.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter Transaction ID!",
      });
      return;
    }

    try {
      const res = await verifyPersonalBkash({
        planId: selectedPlanId,
        transactionId: trxId.trim(),
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Payment Verified! 🎉",
        text2: res.message,
      });
      router.replace("/(app)/(tabs)");
    } catch (err: any) {
      console.error("Personal payment verification failed:", err);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: err?.data?.message || "Invalid Transaction ID. Please check and try again.",
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
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} className="p-1">
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

        {/* Payment Type Selector */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
          Select Payment Method:
        </Text>
        <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-6 gap-x-2">
          <TouchableOpacity 
            onPress={() => setPaymentMethod("AUTO")}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${paymentMethod === "AUTO" ? "bg-white shadow-sm" : "bg-transparent"}`}
          >
            <Text className={`text-xs font-black ${paymentMethod === "AUTO" ? "text-emerald-600" : "text-gray-500"}`}>bKash Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setPaymentMethod("MANUAL")}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${paymentMethod === "MANUAL" ? "bg-white shadow-sm" : "bg-transparent"}`}
          >
            <Text className={`text-xs font-black ${paymentMethod === "MANUAL" ? "text-emerald-600" : "text-gray-500"}`}>Personal bKash (Manual)</Text>
          </TouchableOpacity>
        </View>

        {/* Manual Payment Section instructions */}
        {paymentMethod === "MANUAL" && (
          <View className="bg-slate-50 border border-slate-100 p-5 rounded-3xl mb-8">
            <Text className="text-sm font-extrabold text-slate-800 mb-3">বিকাশ পার্সোনাল পেমেন্ট নির্দেশিকা:</Text>
            
            <View className="space-y-2.5 mb-5">
              <Text className="text-xs text-slate-600 leading-normal font-semibold">
                ১. আপনার বিকাশ অ্যাপ থেকে এই পার্সোনাল নাম্বারে <Text className="font-extrabold text-slate-900">Send Money</Text> করুন:
              </Text>
              <View className="bg-white border border-slate-200 p-3 rounded-2xl flex-row justify-between items-center">
                <Text className="text-lg font-black text-slate-900">01608414032</Text>
                <Text className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Personal</Text>
              </View>
              <Text className="text-xs text-slate-600 leading-normal font-semibold">
                ২. টাকা পাঠানোর পরিমাণ: <Text className="font-extrabold text-emerald-600">{PLANS.find(p => p.id === selectedPlanId)?.price || "Selected Plan Amount"}</Text>
              </Text>
              <Text className="text-xs text-slate-600 leading-normal font-semibold">
                ৩. টাকা পাঠানো সফল হলে যে <Text className="font-extrabold text-slate-900">Transaction ID (TrxID)</Text> পাবেন, তা নিচের বক্সে লিখে সাবমিট করুন।
              </Text>
            </View>

            <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 ml-1">Transaction ID (TrxID)</Text>
            <TextInput
              value={trxId}
              onChangeText={setTrxId}
              placeholder="e.g. A1B2C3D4"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, color: "#1E293B", fontWeight: "bold", fontSize: 14, marginBottom: 2 }}
            />
          </View>
        )}
      </ScrollView>

      {/* Footer Purchase Action */}
      <View className="bg-white border-t border-gray-100 px-6 py-4">
        {paymentMethod === "AUTO" ? (
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
        ) : (
          <TouchableOpacity
            onPress={handleVerifyPersonal}
            disabled={isVerifyingPersonal}
            className="w-full bg-indigo-500 py-4 rounded-2xl items-center justify-center shadow flex-row space-x-2.5 active:bg-indigo-600"
          >
            {isVerifyingPersonal ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text className="text-white font-extrabold text-base">Verify & Activate Premium</Text>
                <Ionicons name="checkmark-done-circle" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        )}
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
