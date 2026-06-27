import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetQuizByStoryIdQuery, useSubmitQuizAnswersMutation, SubmitQuizResponse } from "@/redux/api/quizApi";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();

  // Queries & Mutations
  const { data: quiz, isLoading, error, refetch } = useGetQuizByStoryIdQuery(lessonId);
  const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizAnswersMutation();

  // Local State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [currentSelected, setCurrentSelected] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitQuizResponse | null>(null);

  const handleOptionSelect = (optionIdx: number) => {
    setCurrentSelected(optionIdx);
  };

  const handleNext = async () => {
    if (currentSelected === null) {
      Toast.show({
        type: "error",
        text1: "Please select an answer first!",
      });
      return;
    }

    const updatedAnswers = [...selectedAnswers, currentSelected];
    setSelectedAnswers(updatedAnswers);
    setCurrentSelected(null);

    if (quiz && currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Last question completed, submit to server
      try {
        const response = await submitQuiz({
          storyId: lessonId,
          answers: updatedAnswers,
        }).unwrap();
        setSubmitResult(response);
        setShowResults(true);
      } catch (err: any) {
        console.error("Failed to submit quiz:", err);
        Toast.show({
          type: "error",
          text1: "Error submitting quiz answers.",
          text2: err?.data?.message || "Please check your network connection.",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-500 font-semibold mt-4">Loading quiz questions...</Text>
      </SafeAreaView>
    );
  }

  if (error || !quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-gray-800 font-bold text-lg mt-4 text-center">No Quiz Available</Text>
        <Text className="text-gray-500 text-sm text-center mt-2 mb-6">
          There are no questions seeded for this story yet.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-emerald-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progressPercent = ((currentQuestionIdx) / quiz.questions.length) * 100;

  // Render the post-quiz summary view
  if (showResults && submitResult) {
    const isPerfect = submitResult.score === 100;
    const scoreColor = isPerfect ? "text-emerald-500" : "text-amber-500";

    return (
      <SafeAreaView style={styles.safe} className="px-6 justify-center items-center flex-1">
        <View className="bg-white border border-gray-100 p-8 rounded-3xl w-full shadow-lg items-center">
          <Text className="text-6xl mb-2">{isPerfect ? "🎉" : "💪"}</Text>
          <Text className="text-2xl font-black text-gray-800 text-center">
            {isPerfect ? "Excellent Job!" : "Keep Practicing!"}
          </Text>
          <Text className="text-sm font-semibold text-gray-400 text-center mt-1">
            You completed the quiz for this story.
          </Text>

          {/* Stats Breakdown */}
          <View className="flex-row justify-around w-full mt-6 py-4 border-t border-b border-gray-100">
            <View className="items-center">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</Text>
              <Text className={`text-2xl font-black ${scoreColor}`}>{submitResult.score}%</Text>
            </View>
            <View className="items-center">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correct</Text>
              <Text className="text-2xl font-black text-gray-800">
                {submitResult.correctCount} / {submitResult.totalQuestions}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">XP Earned</Text>
              <Text className="text-2xl font-black text-amber-500 flex-row items-center">
                🔥 +{submitResult.xpEarned}
              </Text>
            </View>
          </View>

          {/* Correct options feedback summary */}
          <ScrollView className="max-h-40 w-full mt-4" showsVerticalScrollIndicator={false}>
            {quiz.questions.map((q, idx) => {
              const selectedIdx = selectedAnswers[idx];
              const correctIdx = submitResult.correctAnswers[idx];
              const wasCorrect = selectedIdx === correctIdx;

              return (
                <View key={q.id} className="py-2 border-b border-gray-50 flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs font-bold text-gray-700" numberOfLines={1}>
                      {idx + 1}. {q.questionText}
                    </Text>
                    <Text className="text-[10px] text-gray-400" numberOfLines={1}>
                      Answer: {q.options[correctIdx]}
                    </Text>
                  </View>
                  <Ionicons
                    name={wasCorrect ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={wasCorrect ? "#10B981" : "#EF4444"}
                  />
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={() => router.replace("/(app)/(tabs)")}
            className="bg-emerald-500 w-full py-3.5 rounded-2xl items-center justify-center mt-6 shadow"
          >
            <Text className="text-white font-extrabold text-base">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} className="flex-1">
      {/* Header with Exit option */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 px-4">
          <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <View style={{ width: `${progressPercent}%` }} className="h-full bg-emerald-500" />
          </View>
        </View>
        <Text className="text-sm font-bold text-gray-400 ml-2">
          {currentQuestionIdx + 1} / {quiz.questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6">
        {/* Question Text */}
        <View className="mb-6 bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
          <Text className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Question</Text>
          <Text className="text-lg font-black text-gray-800 leading-snug">
            {currentQuestion.questionText}
          </Text>
          {currentQuestion.questionTextBn && (
            <Text className="text-sm font-semibold text-gray-400 font-bangla mt-1 leading-snug">
              {currentQuestion.questionTextBn}
            </Text>
          )}
        </View>

        {/* Options */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
          Select the correct option:
        </Text>
        <View className="space-y-3.5 mb-8">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = currentSelected === idx;
            const letter = String.fromCharCode(65 + idx); // A, B, C...

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleOptionSelect(idx)}
                activeOpacity={0.8}
                className={`flex-row items-center border p-4.5 rounded-2xl ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-500 shadow-sm"
                    : "bg-white border-gray-100"
                }`}
                style={styles.optionBtn}
              >
                <View
                  className={`w-7 h-7 rounded-lg border items-center justify-center mr-3.5 ${
                    isSelected ? "bg-emerald-500 border-emerald-600" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text className={`font-black text-xs ${isSelected ? "text-white" : "text-gray-500"}`}>
                    {letter}
                  </Text>
                </View>
                <Text className={`text-base font-semibold flex-1 ${isSelected ? "text-emerald-950 font-bold" : "text-gray-700"}`}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next/Submit Button Dock */}
      <View className="bg-white border-t border-gray-100 px-6 py-4">
        <TouchableOpacity
          onPress={handleNext}
          disabled={currentSelected === null || isSubmitting}
          className={`w-full py-4 rounded-2xl items-center justify-center shadow flex-row space-x-2 ${
            currentSelected === null ? "bg-gray-200" : "bg-emerald-500"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text className="text-white font-extrabold text-base">
                {currentQuestionIdx === quiz.questions.length - 1 ? "Submit Answers" : "Next Question"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  optionBtn: { minHeight: 60 },
});
