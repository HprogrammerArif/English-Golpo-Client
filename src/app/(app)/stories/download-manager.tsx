// src/app/(app)/stories/download-manager.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGetStoriesQuery, Story } from "@/redux/api/storyApi";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { isStoryDownloaded, deleteStoryAssets, downloadStoryAssets } from "@/services/offlineStorage";
import Toast from "react-native-toast-message";

export default function DownloadManagerScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const { data: stories, isLoading } = useGetStoriesQuery({ path: user?.learningPath || "KIDS" });
  
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const storyList = Array.isArray(stories)
    ? stories
    : (stories && typeof stories === "object" && "stories" in (stories as any) && Array.isArray((stories as any).stories))
    ? (stories as any).stories
    : [];

  // Check downloaded status on load
  const refreshDownloads = async () => {
    if (storyList.length === 0) return;
    const downloaded: string[] = [];
    for (const story of storyList) {
      const isOk = await isStoryDownloaded(story.id);
      if (isOk) {
        downloaded.push(story.id);
      }
    }
    setDownloadedIds(downloaded);
  };

  useEffect(() => {
    refreshDownloads();
  }, [stories]);

  const handleDownload = async (story: Story) => {
    setDownloadingId(story.id);
    setDownloadProgress(0);
    
    const success = await downloadStoryAssets(story, (progress) => {
      setDownloadProgress(progress);
    });

    setDownloadingId(null);

    if (success) {
      Toast.show({
        type: "success",
        text1: "Story Downloaded! 📥",
        text2: `"${story.title}" is now available offline.`,
      });
      refreshDownloads();
    } else {
      Alert.alert("Error", "Failed to cache story files. Check your device storage.");
    }
  };

  const handleDelete = async (storyId: string, title: string) => {
    Alert.alert(
      "Delete Cache",
      `Are you sure you want to remove offline files for "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const ok = await deleteStoryAssets(storyId);
            if (ok) {
              Toast.show({
                type: "info",
                text1: "Cache Cleared 🧹",
                text2: "Story files removed from offline storage.",
              });
              refreshDownloads();
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-500 font-semibold mt-4">Loading stories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-gray-800">Offline Downloads</Text>
        <TouchableOpacity onPress={refreshDownloads} className="p-1">
          <Ionicons name="refresh" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} className="px-5 py-5">
        <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Offline Storage</Text>
        <Text className="text-base font-bold text-gray-800 mb-5">
          Download stories to read and listen when offline or on weak networks.
        </Text>

        <View className="space-y-4">
          {storyList.map((story: any) => {
            const isCached = downloadedIds.includes(story.id);
            const isDownloading = downloadingId === story.id;

            return (
              <View key={story.id} className="bg-white border border-gray-100 rounded-3xl p-4.5 flex-row items-center justify-between shadow-sm">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center space-x-1.5 mb-1">
                    <Text className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      LEVEL {story.level}
                    </Text>
                    {isCached && (
                      <Text className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                        Offline Cache
                      </Text>
                    )}
                  </View>
                  <Text className="text-base font-extrabold text-gray-800">{story.title}</Text>
                  <Text className="text-xs font-semibold text-gray-400 font-bangla mt-0.5">{story.titleBn}</Text>
                  <Text className="text-[11px] text-gray-400 font-semibold mt-2.5">
                    {story.wordCount} words • {Math.round(story.durationSeconds / 60)} min read
                  </Text>
                </View>

                {/* Action button */}
                <View>
                  {isDownloading ? (
                    <View className="items-center justify-center p-2.5">
                      <ActivityIndicator size="small" color="#10B981" />
                      <Text className="text-[8px] font-black text-emerald-600 mt-1">
                        {Math.round(downloadProgress * 100)}%
                      </Text>
                    </View>
                  ) : isCached ? (
                    <TouchableOpacity
                      onPress={() => handleDelete(story.id, story.title)}
                      className="bg-red-50 p-3 rounded-2xl active:bg-red-100"
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleDownload(story)}
                      className="bg-emerald-50 p-3 rounded-2xl active:bg-emerald-100"
                    >
                      <Ionicons name="download-outline" size={18} color="#10B981" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {(!stories || stories.length === 0) && (
            <View className="items-center justify-center py-10">
              <Text className="text-2xl mb-1">📚</Text>
              <Text className="text-sm font-semibold text-gray-400">No stories available to download.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingBottom: 40 },
});
