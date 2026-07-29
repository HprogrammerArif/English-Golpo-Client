import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  useSubmitContributionMutation, 
  useGetMyContributionsQuery 
} from "@/redux/api/contributionApi";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function ContributeScreen() {
  const router = useRouter();

  // Form states
  const [contentType, setContentType] = useState<"AUDIO" | "VIDEO" | "ILLUSTRATION">("AUDIO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [targetChildId, setTargetChildId] = useState("");

  const [submitContribution, { isLoading: isSubmitting }] = useSubmitContributionMutation();
  const { data: contributions, isLoading: isLoadingList, refetch } = useGetMyContributionsQuery();

  const handleSubmit = async () => {
    if (!title.trim() || !fileUrl.trim()) {
      Toast.show({
        type: "error",
        text1: "Title and File URL are required",
        text2: "দয়া করে শিরোনাম এবং ফাইল লিঙ্ক প্রদান করুন",
      });
      return;
    }

    if (isPrivate && !targetChildId.trim()) {
      Toast.show({
        type: "error",
        text1: "Target Child ID is required for private videos",
        text2: "সন্তানের ইউজার আইডি প্রয়োজন",
      });
      return;
    }

    try {
      await submitContribution({
        contentType,
        title: title.trim(),
        description: description.trim() || undefined,
        fileUrl: fileUrl.trim(),
        targetChildId: isPrivate ? targetChildId.trim() : undefined,
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Contribution Submitted! 🎉",
        text2: "আপনার অবদান সফলভাবে সাবমিট হয়েছে এবং পর্যালোচনার অধীনে রয়েছে।",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setFileUrl("");
      setIsPrivate(false);
      setTargetChildId("");
      refetch();
    } catch (err: any) {
      console.error("Submission failed:", err);
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: err?.data?.message || "কিছু ভুল হয়েছে, আবার চেষ্টা করুন।",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>অবদান ও আয় করুন</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="cash-outline" size={32} color="#8B5CF6" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>কন্ট্রিবিউটর হাব</Text>
            <Text style={styles.infoSub}>
              আপনার অডিও ভয়েস ওভার, এনিমেশন/অলঙ্করণ অথবা শিক্ষামূলক ভিডিও টিউটোরিয়াল শেয়ার করে আয় করুন। এডমিন এপ্রুভালের পর পেমেন্ট দেওয়া হবে।
            </Text>
          </View>
        </View>

        {/* Form Panel */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>নতুন কন্ট্রিবিউশন ফর্ম</Text>

          {/* Type Picker */}
          <Text style={styles.label}>অবদানের ধরন (ContentType)</Text>
          <View style={styles.typeSelector}>
            {[
              { type: "AUDIO", label: "🎙️ অডিও", desc: "ভয়েস ওভার" },
              { type: "VIDEO", label: "🎥 ভিডিও", desc: "লেসন / গিফট" },
              { type: "ILLUSTRATION", label: "🎨 অলঙ্করণ", desc: "ছবি / এনিমেশন" }
            ].map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeBtn,
                  contentType === item.type && styles.typeBtnActive
                ]}
                onPress={() => {
                  setContentType(item.type as any);
                  if (item.type !== "VIDEO") {
                    setIsPrivate(false);
                  }
                }}
              >
                <Text style={[
                  styles.typeBtnText,
                  contentType === item.type && styles.typeBtnTextActive
                ]}>{item.label}</Text>
                <Text style={[
                  styles.typeBtnDesc,
                  contentType === item.type && styles.typeBtnDescActive
                ]}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Private Video Toggle (Only for Video) */}
          {contentType === "VIDEO" && (
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>ব্যক্তিগত পারিবারিক ভিডিও?</Text>
                <Text style={styles.toggleDesc}>সন্তানের জন্য বার্থডে বা শুভেচ্ছা বার্তা (কোনো পেমেন্ট প্রযোজ্য নয়)</Text>
              </View>
              <Switch 
                value={isPrivate} 
                onValueChange={setIsPrivate}
                trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                thumbColor={isPrivate ? "#10B981" : "#F1F5F9"}
              />
            </View>
          )}

          {/* Target Child ID */}
          {isPrivate && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>সন্তানের ইউজার আইডি (Target Child ID)</Text>
              <TextInput
                style={styles.input}
                value={targetChildId}
                onChangeText={setTargetChildId}
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                placeholderTextColor="#94A3B8"
              />
            </View>
          )}

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>কন্ট্রিবিউশন শিরোনাম (Title)</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. The Magic Paintbrush Voiceover (L2)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>সংক্ষিপ্ত বিবরণ (Description) - ঐচ্ছিক</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. বর্ননা, কোনো বিশেষ নির্দেশনা থাকলে উল্লেখ করুন"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* File URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>মিডিয়া ফাইল লিংক (Public File URL)</Text>
            <TextInput
              style={styles.input}
              value={fileUrl}
              onChangeText={setFileUrl}
              placeholder="e.g. গুগল ড্রাইভ, ড্রপবক্স বা ক্লাউডিনারি লিংক"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helpText}>
              💡 নিশ্চিত করুন লিংকটি public এবং সরাসরি অ্যাক্সেসযোগ্য।
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>আবেদন পেশ করুন</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* History Panel */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>আমার অবদান সমূহ</Text>

          {isLoadingList ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginTop: 20 }} />
          ) : !contributions || contributions.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="folder-open-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>এখনো কোনো কন্ট্রিবিউশন করেননি।</Text>
            </View>
          ) : (
            contributions.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyCardTitle}>{item.title}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.createdAt).toLocaleDateString("bn-BD")}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    item.status === "APPROVED" ? styles.statusApproved :
                    item.status === "REJECTED" ? styles.statusRejected : styles.statusPending
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      item.status === "APPROVED" ? styles.statusApprovedText :
                      item.status === "REJECTED" ? styles.statusRejectedText : styles.statusPendingText
                    ]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.historyDivider} />

                <View style={styles.historyDetails}>
                  <Text style={styles.detailText}>
                    টাইপ: <Text style={{ fontWeight: "700" }}>{item.contentType}</Text>
                  </Text>
                  <Text style={styles.detailText}>
                    আয়: <Text style={{ color: "#059669", fontWeight: "700" }}>{item.payoutAmount} BDT</Text>
                  </Text>
                  <Text style={[
                    styles.detailText, 
                    item.payoutStatus === "PAID" ? { color: "#10B981" } : 
                    item.payoutStatus === "UNPAID" ? { color: "#D97706" } : { color: "#64748B" }
                  ]}>
                    পেমেন্ট: <Text style={{ fontWeight: "700" }}>{item.payoutStatus}</Text>
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0"
  },
  backBtn: { padding: 4 },
  refreshBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "900", color: "#1E293B" },
  scroll: { padding: 16, paddingBottom: 40 },

  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: "center"
  },
  infoTextContainer: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 16, fontWeight: "800", color: "#6D28D9", marginBottom: 3 },
  infoSub: { fontSize: 11, color: "#7C3AED", lineHeight: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: { fontSize: 16, fontWeight: "900", color: "#1E293B", marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "800", color: "#475569", marginBottom: 6 },
  
  typeSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  typeBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  typeBtnActive: {
    backgroundColor: "#EEF2F6",
    borderColor: "#8B5CF6"
  },
  typeBtnText: { fontSize: 11, fontWeight: "800", color: "#64748B" },
  typeBtnTextActive: { color: "#8B5CF6" },
  typeBtnDesc: { fontSize: 8, color: "#94A3B8", marginTop: 2 },
  typeBtnDescActive: { color: "#A78BFA" },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  toggleLabel: { fontSize: 12, fontWeight: "800", color: "#1E293B" },
  toggleDesc: { fontSize: 9, color: "#64748B", marginTop: 1, marginRight: 8 },

  inputGroup: { marginBottom: 14 },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600"
  },
  textArea: {
    height: 80,
    textAlignVertical: "top"
  },
  helpText: { fontSize: 10, color: "#64748B", marginTop: 4, fontStyle: "italic" },

  submitBtn: {
    backgroundColor: "#8B5CF6",
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  submitBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  /* History list */
  historySection: { marginTop: 28 },
  historyTitle: { fontSize: 16, fontWeight: "900", color: "#1E293B", marginBottom: 12 },
  emptyHistory: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  emptyText: { fontSize: 12, color: "#64748B", fontWeight: "600" },

  historyCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  historyCardTitle: { fontSize: 13, fontWeight: "800", color: "#1E293B", flex: 1, marginRight: 8 },
  historyDate: { fontSize: 9, color: "#94A3B8", marginTop: 2, fontWeight: "600" },
  
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusPending: { backgroundColor: "#FEF3C7" },
  statusApproved: { backgroundColor: "#D1FAE5" },
  statusRejected: { backgroundColor: "#FEE2E2" },
  
  statusBadgeText: { fontSize: 9, fontWeight: "800" },
  statusPendingText: { color: "#D97706" },
  statusApprovedText: { color: "#059669" },
  statusRejectedText: { color: "#DC2626" },

  historyDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  historyDetails: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  detailText: { fontSize: 11, color: "#475569", fontWeight: "600" }
});
