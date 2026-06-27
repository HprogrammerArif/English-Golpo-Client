import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetStoryByIdQuery } from "@/redux/api/storyApi";
import { StoryReader } from "@/components/story/StoryReader";
import { Ionicons } from "@expo/vector-icons";

export default function StoryDetailScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();

  const { data: story, isLoading, error, refetch } = useGetStoryByIdQuery(storyId);

  const handleFinish = () => {
    // Navigate to the quiz screen, passing the storyId as lessonId
    router.replace({
      pathname: "/(app)/quiz/[lessonId]",
      params: { lessonId: storyId },
    } as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-500 font-semibold mt-4">Loading story...</Text>
      </SafeAreaView>
    );
  }

  if (error || !story) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-gray-800 font-bold text-lg mt-4 text-center">Failed to Load Story</Text>
        <Text className="text-gray-500 text-sm text-center mt-2 mb-6">
          The story could not be retrieved from the server. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-emerald-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header bar */}
      <View className="bg-white border-b border-gray-100 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text numberOfLines={1} className="text-base font-extrabold text-gray-800 flex-1 mx-3 text-center">
          {story.title}
        </Text>
        {/* Placeholder to keep alignment */}
        <View className="w-10" />
      </View>

      {/* Reader Component */}
      <StoryReader story={story} onFinish={handleFinish} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
});
