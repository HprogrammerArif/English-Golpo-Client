import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";

/**
 * Tab Navigator — 4 tabs: Home, Explore, Leagues, Profile
 * Notifications moved to Home header icon.
 * Notifications tab removed per UX redesign.
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
          title: "Explore",
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
      {/* Hide notifications tab — moved to Home header */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leagues",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="trophy-outline"
              iconNameFocused="trophy"
              label="Leagues"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
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
    height: Platform.OS === "ios" ? 84 : 64,
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
