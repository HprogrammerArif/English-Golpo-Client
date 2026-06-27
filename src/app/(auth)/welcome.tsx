import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientButton } from "@/components/GradientButton";

const SLIDES = [
  {
    id: "1",
    emoji: "📚",
    title: "English Golpo",
    description: "বাঙালিদের জন্য গল্পে গল্পে ইংরেজি শেখার সবচেয়ে আকর্ষণীয় এবং সহজ প্ল্যাটফর্ম!",
  },
  {
    id: "2",
    emoji: "🎙️",
    title: "Interactive Audios",
    description: "প্রতিটি বাক্যের অডিও শুনুন, শব্দার্থ জানুন স্পর্শেই এবং উচ্চারণ সংশোধন করুন এআই দিয়ে।",
  },
  {
    id: "3",
    emoji: "🎯",
    title: "Select Learning Path",
    description: "আপনার পছন্দ অনুযায়ী যেকোনো একটি শিক্ষার মাধ্যম বেছে নিন শুরু করতে:",
  },
];

const PATHS = [
  { id: "KIDS", titleBn: "বাচ্চাদের ইংরেজি", titleEn: "Kids English", sub: "Phonics & simple stories (Ages 4-12)", icon: "happy-outline" },
  { id: "SPOKEN", titleBn: "স্পোকেন ইংলিশ", titleEn: "Spoken English", sub: "Daily speaking & dialogues", icon: "mic-outline" },
  { id: "JOB", titleBn: "চাকরি প্রার্থীদের ইংরেজি", titleEn: "Job Seekers English", sub: "Interviews, presentations & business", icon: "briefcase-outline" },
  { id: "IELTS", titleBn: "আইইএলটিএস প্রস্তুতি", titleEn: "IELTS Prep", sub: "Master high-score bands & writing", icon: "school-outline" },
];

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPath, setSelectedPath] = useState("KIDS");
  const flatListRef = useRef<FlatList>(null);

  const isLast = activeIndex === SLIDES.length - 1;

  const goToNext = () => {
    if (isLast) {
      // Redirect to placement test with the selected learning path
      router.replace({
        pathname: "/(auth)/placement-test",
        params: { path: selectedPath }
      } as any);
    } else {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({ index: SLIDES.length - 1, animated: true });
    setActiveIndex(SLIDES.length - 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <ScrollView contentContainerStyle={styles.slideScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>

              {/* Render path cards only on the last slide */}
              {item.id === "3" && (
                <View style={styles.pathsContainer}>
                  {PATHS.map((path) => {
                    const isSelected = selectedPath === path.id;
                    return (
                      <TouchableOpacity
                        key={path.id}
                        onPress={() => setSelectedPath(path.id)}
                        style={[styles.pathCard, isSelected && styles.pathCardSelected]}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                          <Ionicons
                            name={path.icon as any}
                            size={20}
                            color={isSelected ? "#fff" : "#10B981"}
                          />
                        </View>
                        <View style={styles.pathTextWrap}>
                          <Text style={[styles.pathTitle, isSelected && styles.pathTitleSelected]}>
                            {path.titleBn}
                          </Text>
                          <Text style={styles.pathSub}>{path.sub}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Button */}
      <View style={styles.btnWrap}>
        <GradientButton
          title={isLast ? "Start Free Placement Test" : "Next"}
          onPress={goToNext}
          leftIcon={
            isLast ? undefined : (
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            )
          }
        />
        {isLast && (
          <TouchableOpacity style={styles.signInLink} onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={styles.signInBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  skipBtn: { position: "absolute", top: 20, right: 20, zIndex: 10, padding: 8 },
  skipText: { color: "#6B7280", fontWeight: "600", fontSize: 15 },
  slide: {
    flex: 1,
  },
  slideScroll: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  emojiCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emoji: { fontSize: 50 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  pathsContainer: {
    width: "100%",
    gap: 10,
    marginTop: 5,
  },
  pathCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    width: "100%",
  },
  pathCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconCircleSelected: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  pathTextWrap: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  pathTitleSelected: {
    color: "#065F46",
  },
  pathSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#10B981",
  },
  btnWrap: { paddingHorizontal: 24, paddingBottom: 20, gap: 10 },
  signInLink: { alignItems: "center", paddingVertical: 4 },
  signInText: { color: "#6B7280", fontSize: 14 },
  signInBold: { color: "#10B981", fontWeight: "700" },
});
