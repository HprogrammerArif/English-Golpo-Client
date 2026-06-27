// src/app/(app)/growth/review-prompt.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function ReviewPromptScreen() {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleStarPress = (stars: number) => {
    setRating(stars);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setIsSubmitting(true);
    
    // Simulate API call to register feedback
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsCompleted(true);

    if (rating >= 4) {
      Toast.show({
        type: "success",
        text1: "Thank you for the support! 💖",
        text2: "Triggering store review prompt...",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Feedback received! ✉️",
        text2: "We will use your notes to improve the experience.",
      });
    }

    setTimeout(() => {
      router.back();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe} className="px-6 justify-center items-center flex-1">
      <View className="bg-white border border-gray-100 p-7 rounded-3xl w-full shadow-lg items-center">
        
        {/* Close Button */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="absolute top-4 right-4 p-1"
        >
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {isCompleted ? (
          <View className="items-center py-6">
            <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={36} color="#10B981" />
            </View>
            <Text className="text-xl font-black text-gray-800 text-center">Thank You!</Text>
            <Text className="text-sm text-gray-400 font-semibold text-center mt-1">
              Your feedback helps us make English Golpo better.
            </Text>
          </View>
        ) : (
          <View className="w-full items-center">
            <Text className="text-4xl mb-2">🎉</Text>
            <Text className="text-xl font-black text-gray-800 text-center">Loving English Golpo?</Text>
            <Text className="text-sm font-semibold text-gray-400 text-center mt-1.5 px-4">
              How would you rate your learning experience so far?
            </Text>

            {/* Stars Row */}
            <View className="flex-row space-x-3.5 my-6">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = rating !== null && star <= rating;
                return (
                  <TouchableOpacity 
                    key={star} 
                    onPress={() => handleStarPress(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={isActive ? "star" : "star-outline"} 
                      size={36} 
                      color={isActive ? "#F59E0B" : "#D1D5DB"} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Conditional feedback field */}
            {rating !== null && rating < 4 && (
              <View className="w-full mb-5">
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 ml-1">
                  How can we improve? (আপনার মতামত লিখুন)
                </Text>
                <TextInput
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="Tell us what you didn't like..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 border border-gray-150 rounded-2xl p-4.5 text-gray-800 text-sm h-24 text-left justify-start"
                  style={{ textAlignVertical: "top" }}
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={rating === null || isSubmitting}
              className={`w-full py-4 rounded-2xl items-center justify-center shadow flex-row space-x-2 ${
                rating === null ? "bg-gray-200" : "bg-emerald-500 active:bg-emerald-600"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text className="text-white font-extrabold text-base">Submit Review</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
});
