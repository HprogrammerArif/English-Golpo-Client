import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GradientButton } from "@/components/GradientButton";

// ─── Onboarding data ─────────────────────────────────────────────────────────
// Replace emoji with actual illustrations / Lottie when you have assets
const SLIDES = [
  {
    id: "1",
    emoji: "🚀",
    title: "Welcome to the App",
    description:
      "Everything you need in one place. Fast, simple, and built for you.",
  },
  {
    id: "2",
    emoji: "🔒",
    title: "Safe & Secure",
    description:
      "Your data is encrypted end-to-end. Privacy is not an afterthought.",
  },
  {
    id: "3",
    emoji: "✨",
    title: "Ready to Start?",
    description:
      "Create your account in seconds. No credit card required.",
  },
];

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLast = activeIndex === SLIDES.length - 1;

  const goToNext = () => {
    if (isLast) {
      router.replace("/(auth)/login");
    } else {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/login");
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
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
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
          title={isLast ? "Get Started" : "Next"}
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
  skipBtn: { position: "absolute", top: 56, right: 20, zIndex: 10, padding: 8 },
  skipText: { color: "#6B7280", fontWeight: "600", fontSize: 15 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingTop: 40,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#2B7FFF",
  },
  btnWrap: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  signInLink: { alignItems: "center", paddingVertical: 4 },
  signInText: { color: "#6B7280", fontSize: 14 },
  signInBold: { color: "#2B7FFF", fontWeight: "700" },
});
