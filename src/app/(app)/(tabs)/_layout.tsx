import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";

/**
 * Tab Navigator — 5 tabs: Home, Stories, Practice, Video, Me
 *
 * Navigation design decisions:
 * - Leaderboard moved INTO Profile/Me tab (as a scrollable section)
 * - Notifications icon stays in Home header
 * - Video tab added for English-learning video content (kids + students)
 * - leaderboard screen hidden from tab bar (href: null) but still accessible
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="home-outline"
              iconNameFocused="home"
              label="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Stories",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="book-outline"
              iconNameFocused="book"
              label="Stories"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="flash-outline"
              iconNameFocused="flash"
              label="Practice"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: "Videos",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="play-circle-outline"
              iconNameFocused="play-circle"
              label="Videos"
            />
          ),
        }}
      />
      {/* Leaderboard hidden from tab bar — embedded inside Profile screen */}
      <Tabs.Screen
        name="leaderboard"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="person-outline"
              iconNameFocused="person"
              label="Me"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 88 : 72,
    paddingBottom: Platform.OS === "ios" ? 20 : 6,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0FDF4",
    elevation: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabItem: { padding: 0 },
});
