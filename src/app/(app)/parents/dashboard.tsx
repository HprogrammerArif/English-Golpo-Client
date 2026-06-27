import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useGetParentDashboardQuery, useLinkChildAccountMutation } from "@/redux/api/accountsApi";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function ParentsDashboardScreen() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetParentDashboardQuery();
  const [linkChild, { isLoading: isLinking }] = useLinkChildAccountMutation();

  const [childPhone, setChildPhone] = useState("");

  const handleLinkChild = async () => {
    if (!childPhone.trim()) {
      Toast.show({
        type: "error",
        text1: "Phone number required",
      });
      return;
    }

    try {
      await linkChild({ childPhone }).unwrap();
      Toast.show({
        type: "success",
        text1: "Child Linked Successfully! 👨‍👩‍👦",
        text2: `Linked user with phone: ${childPhone}`,
      });
      setChildPhone("");
      refetch();
    } catch (err: any) {
      console.error("Linking failed:", err);
      Toast.show({
        type: "error",
        text1: "Linking Failed",
        text2: err?.data?.message || "Verify if the child's phone number is registered.",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-gray-500 font-semibold mt-4">Opening Parent Dashboard...</Text>
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
        <Text className="text-lg font-black text-gray-800">Parental Control</Text>
        <TouchableOpacity onPress={() => refetch()} className="p-1">
          <Ionicons name="refresh" size={20} color="#F97316" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Intro Banner */}
        <View className="bg-orange-50 border border-orange-100 p-5 rounded-3xl mb-6">
          <View className="flex-row items-center space-x-3 mb-2">
            <Text className="text-2xl">👨‍👩‍👦</Text>
            <Text className="text-base font-black text-orange-950">Track Child Progress</Text>
          </View>
          <Text className="text-xs font-semibold text-orange-800 leading-relaxed">
            Link your children's learning accounts to view their weekly accumulated XP, streak flames, and active learning calendars.
          </Text>
        </View>

        {/* Link Child Form */}
        <View className="bg-white border border-gray-100 p-5 rounded-3xl mb-6 shadow-sm">
          <Text className="text-[15px] font-black text-gray-800 mb-1">Add Child Account</Text>
          <Text className="text-xs font-semibold text-gray-400 mb-4">
            Enter the registered phone number of your child.
          </Text>
          
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 flex-row items-center gap-2">
              <Ionicons name="call-outline" size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-sm font-semibold text-gray-800"
                placeholder="Child phone (e.g. 017...)"
                placeholderTextColor="#9CA3AF"
                value={childPhone}
                onChangeText={setChildPhone}
                keyboardType="phone-pad"
              />
            </View>
            
            <TouchableOpacity
              onPress={handleLinkChild}
              disabled={isLinking}
              className="bg-orange-500 px-5 rounded-2xl justify-center items-center active:bg-orange-600"
            >
              {isLinking ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-extrabold text-sm">Link</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Linked Children List */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5 ml-2">
          Linked Children Accounts:
        </Text>

        {error ? (
          <View className="p-6 bg-red-50 border border-red-100 rounded-3xl items-center">
            <Text className="text-red-700 font-bold text-center">Failed to load parental relations.</Text>
          </View>
        ) : !data?.children || data.children.length === 0 ? (
          <View className="items-center py-10 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <Text className="text-4xl mb-2">🔭</Text>
            <Text className="text-gray-400 font-bold text-[15px]">No children linked yet</Text>
            <Text className="text-xs text-gray-400 mt-1">Enter your child's phone number above to start tracking.</Text>
          </View>
        ) : (
          <View className="space-y-4">
            {data.children.map((child) => (
              <View key={child.id} className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
                {/* Child header */}
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="text-base font-black text-gray-800">{child.name}</Text>
                    {child.phone && (
                      <Text className="text-xs font-semibold text-gray-400 mt-0.5">{child.phone}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                    <Ionicons name="flame" size={14} color="#F97316" />
                    <Text className="text-xs font-bold text-orange-800">{child.streak} Days</Text>
                  </View>
                </View>

                {/* Child stats block */}
                <View className="flex-row justify-between pt-3 border-t border-gray-50">
                  <View>
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total XP</Text>
                    <Text className="text-[15px] font-black text-gray-800 mt-0.5">{child.xpTotal} XP</Text>
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Weekly XP</Text>
                    <Text className="text-[15px] font-black text-orange-500 mt-0.5">{child.weeklyXp} XP</Text>
                  </View>
                  <View>
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Lives Left</Text>
                    <Text className="text-[15px] font-black text-red-500 mt-0.5">❤️ {child.lives}</Text>
                  </View>
                </View>

                {/* Calendar summary indicator */}
                {child.activityCalendar && child.activityCalendar.length > 0 && (
                  <View className="mt-3.5 pt-3.5 border-t border-gray-50">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                      Recent Activity Calendar
                    </Text>
                    <View className="flex-row gap-1 flex-wrap">
                      {child.activityCalendar.slice(0, 10).map((dateStr, idx) => (
                        <View key={idx} className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <Text className="text-[9px] font-bold text-emerald-700">
                            {new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
});
