import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { TabBarIcon } from "@/components/TabBarIcon";

/**
 * Tab Navigator — 4 tabs: Home, Explore, Notifications, Profile
 * All screens inside (app)/(tabs)/ are automatically auth-protected by the parent (app)/_layout.tsx
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
              iconName="compass-outline"
              iconNameFocused="compass"
              label="Explore"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="notifications-outline"
              iconNameFocused="notifications"
              label="Alerts"
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
              label="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 88 : 68,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: { padding: 0 },
});
