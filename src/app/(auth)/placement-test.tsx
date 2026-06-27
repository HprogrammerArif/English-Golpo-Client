import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const QUESTIONS = [
  {
    question: "Translate this word: 'Hen'",
    bangla: "'Hen' শব্দের অর্থ কী?",
    options: ["গরু", "মুরগি", "কাক", "ছাগল"],
    correctIdx: 1,
  },
  {
    question: "Which word means: 'ভ্রমণ'?",
    bangla: "কোন শব্দটির অর্থ 'ভ্রমণ'?",
    options: ["Sleep", "Eat", "Travel", "Run"],
    correctIdx: 2,
  },
  {
    question: "Complete: 'She ___ to school every day.'",
    bangla: "শূন্যস্থান পূরণ করুন: 'She ___ to school every day.'",
    options: ["go", "goes", "going", "gone"],
    correctIdx: 1,
  },
];

export default function PlacementTestScreen() {
  const { path } = useLocalSearchParams();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentQuestion = QUESTIONS[currentIdx];

  const handleOptionPress = (idx: number) => {
    setSelectedIdx(idx);
    
    // Track correct answers
    if (idx === currentQuestion.correctIdx) {
      setScore(prev => prev + 1);
    }

    // Delay briefly to show selection state
    setTimeout(() => {
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setSelectedIdx(null);
      } else {
        // Run analyzing animation
        setIsAnalyzing(true);
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsFinished(true);
        }, 2000);
      }
    }, 500);
  };

  const handleFinish = () => {
    // Navigate to register screen, passing learningPath and score
    router.replace({
      pathname: "/(auth)/register",
      params: { path: path || "KIDS", score: score * 10 }
    } as any);
  };

  if (isAnalyzing) {
    return (
      <SafeAreaView style={styles.safe} className="items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-lg font-bold text-gray-800 mt-4">Analyzing your answers...</Text>
        <Text className="text-sm text-gray-500 mt-1">Creating your personalized English learning path.</Text>
      </SafeAreaView>
    );
  }

  if (isFinished) {
    const levelName = score === QUESTIONS.length ? "ELEMENTARY (LEVEL 2)" : "BEGINNER (LEVEL 1)";
    return (
      <SafeAreaView style={styles.safe} className="px-6 justify-center">
        <View className="items-center mb-8">
          <View className="bg-emerald-50 w-24 h-24 rounded-full items-center justify-center mb-4">
            <Ionicons name="ribbon-outline" size={54} color="#10B981" />
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 text-center">Plan Created!</Text>
          <Text className="text-sm text-gray-500 text-center mt-2 px-6">
            We have designed a custom story map based on your results.
          </Text>
        </View>

        {/* Level card */}
        <View className="bg-emerald-50/50 border-2 border-emerald-400 p-6 rounded-3xl mb-8 items-center shadow-sm">
          <Text className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Your Assessed Level</Text>
          <Text className="text-2xl font-extrabold text-emerald-800 mt-1">{levelName}</Text>
          <Text className="text-xs text-gray-500 text-center mt-3 leading-relaxed px-4">
            You scored {score}/{QUESTIONS.length} points. We will start your path with curated illustrated stories aligned with this level.
          </Text>
        </View>

        {/* Commitment pitch */}
        <View className="bg-gray-50 p-5 rounded-2xl mb-8 flex-row items-center space-x-3.5">
          <Ionicons name="shield-checkmark" size={26} color="#10B981" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-800">100% Kid-Safe & Ad-Free Options</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Interactive pronunciation exercises included.</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleFinish}
          activeOpacity={0.8}
          className="bg-emerald-500 h-14 rounded-full items-center justify-center flex-row space-x-2 shadow-md active:bg-emerald-600"
        >
          <Text className="text-white font-extrabold text-base">Claim My Learning Plan</Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const progressPercent = ((currentIdx + 1) / QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.safe} className="px-6 justify-between py-6">
      {/* Progress Bar */}
      <View>
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text className="text-sm font-bold text-gray-500">
            Question {currentIdx + 1} of {QUESTIONS.length}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <View style={{ width: `${progressPercent}%` }} className="h-full bg-emerald-500" />
        </View>
      </View>

      {/* Question */}
      <View className="my-10 items-center">
        <Text className="text-[22px] font-extrabold text-gray-900 text-center leading-snug">
          {currentQuestion.question}
        </Text>
        {currentQuestion.bangla && (
          <Text className="text-sm font-medium text-gray-400 mt-2 text-center">
            {currentQuestion.bangla}
          </Text>
        )}
      </View>

      {/* Options list */}
      <View className="space-y-3.5 mb-10">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = idx === currentQuestion.correctIdx;
          
          let cardStyle = "border-gray-200 bg-white";
          let textStyle = "text-gray-700";

          if (selectedIdx !== null) {
            if (isSelected) {
              cardStyle = isCorrect ? "border-emerald-500 bg-emerald-50" : "border-red-500 bg-red-50";
              textStyle = isCorrect ? "text-emerald-700" : "text-red-700";
            } else if (isCorrect) {
              cardStyle = "border-emerald-500 bg-emerald-50";
              textStyle = "text-emerald-700";
            }
          }

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => selectedIdx === null && handleOptionPress(idx)}
              activeOpacity={0.8}
              disabled={selectedIdx !== null}
              className={`flex-row justify-between items-center p-4 border-2 rounded-2xl ${cardStyle}`}
            >
              <Text className={`text-base font-bold ${textStyle}`}>{option}</Text>
              {selectedIdx !== null && (isSelected || isCorrect) && (
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "close-circle"}
                  size={22}
                  color={isCorrect ? "#10B981" : "#EF4444"}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
});
