// src/app/(app)/paths/index.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCurrentUser, updateUser } from "@/redux/features/auth/authSlice";
import { useUpdateMeMutation } from "@/redux/api/authApi";
import Toast from "react-native-toast-message";

const PATHS = [
  { id: "KIDS", titleBn: "বাচ্চাদের ইংরেজি", titleEn: "Kids English", sub: "Phonics & simple stories (Ages 4-12)", icon: "happy-outline", color: "#10B981" },
  { id: "SPOKEN", titleBn: "স্পোকেন ইংলিশ", titleEn: "Spoken English", sub: "Daily speaking & dialogues", icon: "mic-outline", color: "#3B82F6" },
  { id: "JOB", titleBn: "চাকরি প্রার্থীদের ইংরেজি", titleEn: "Job Seekers English", sub: "Interviews, presentations & business", icon: "briefcase-outline", color: "#F59E0B" },
  { id: "IELTS", titleBn: "আইইএলটিএস প্রস্তুতি", titleEn: "IELTS Prep", sub: "Master high-score bands & writing", icon: "school-outline", color: "#8B5CF6" },
  { id: "VOCAB", titleBn: "শব্দকোষ পারদর্শিতা", titleEn: "Vocabulary Mastery", sub: "Learn high frequency vocabulary", icon: "book-outline", color: "#EC4899" },
];

export default function PathSelectionScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const [selectedPath, setSelectedPath] = useState(user?.learningPath || "KIDS");

  const handleSave = async () => {
    try {
      await updateMe({ learningPath: selectedPath as any }).unwrap();
      dispatch(updateUser({ learningPath: selectedPath as any }));
      
      Toast.show({
        type: "success",
        text1: "Learning Path Updated! 🎯",
        text2: `You are now on the ${selectedPath} learning track.`,
      });
      router.back();
    } catch (err: any) {
      console.error("Failed to update path:", err);
      Toast.show({
        type: "error",
        text1: "Failed to update learning path",
        text2: err?.data?.message || "Please check your internet connection.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-800">Select Learning Path</Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} className="px-6 py-6">
        <Text className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1.5">Learning Roadmap</Text>
        <Text className="text-xl font-black text-gray-900 leading-snug mb-5">
          Choose a path that aligns with your active goals
        </Text>

        <View className="space-y-3.5 mb-8">
          {PATHS.map((path) => {
            const isSelected = selectedPath === path.id;
            return (
              <TouchableOpacity
                key={path.id}
                onPress={() => setSelectedPath(path.id)}
                activeOpacity={0.8}
                style={[
                  styles.card,
                  isSelected && { borderColor: path.color, backgroundColor: `${path.color}08` }
                ]}
              >
                <View 
                  style={{ backgroundColor: isSelected ? path.color : "#F3F4F6" }}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                >
                  <Ionicons 
                    name={path.icon as any} 
                    size={20} 
                    color={isSelected ? "#fff" : "#4B5563"} 
                  />
                </View>

                <View className="flex-1">
                  <Text 
                    className="text-base font-extrabold"
                    style={{ color: isSelected ? path.color : "#1F2937" }}
                  >
                    {path.titleBn}
                  </Text>
                  <Text className="text-[11px] font-bold text-gray-400 mt-0.5">{path.titleEn}</Text>
                  <Text className="text-xs text-gray-400 mt-1 font-semibold leading-relaxed">{path.sub}</Text>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={path.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white border-t border-gray-100 px-6 py-4">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          className="bg-emerald-500 w-full py-4 rounded-2xl items-center justify-center shadow flex-row space-x-2 active:bg-emerald-600"
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text className="text-white font-extrabold text-base">Save Preferences</Text>
              <Ionicons name="checkmark" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    borderRadius: 24,
    padding: 16,
  },
});
