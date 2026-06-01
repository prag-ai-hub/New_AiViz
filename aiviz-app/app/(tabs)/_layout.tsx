import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Platform, View, useWindowDimensions } from "react-native";
import { useTheme } from "@/core/providers";
import { tokens } from "@/core/theme";
import { AivizLogo } from "@/shared/components/branding";
import { Text } from "@/shared/components/typography";

const isWeb = Platform.OS === "web";
const SIDEBAR_WIDTH = 240;
const SIDEBAR_BREAKPOINT = 768;

function useUseSidebar(): boolean {
  const { width } = useWindowDimensions();
  return isWeb && width >= SIDEBAR_BREAKPOINT;
}

function SidebarIcon({ emoji, focused, color }: { emoji: string; focused: boolean; color: string }) {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, color, opacity: focused ? 1 : 0.85 }}>
        {emoji}
      </Text>
    </View>
  );
}

function SidebarTabBar(props: BottomTabBarProps) {
  const { colors } = useTheme();
  const showSidebar = useUseSidebar();
  if (!showSidebar) return <BottomTabBar {...props} />;
  return (
    <View
      style={{
        width: SIDEBAR_WIDTH,
        backgroundColor: colors.bg,
        borderRightWidth: 1,
        borderRightColor: "rgba(31,190,214,0.18)",
      }}
    >
      <View
        style={{
          paddingHorizontal: tokens.spacing.lg,
          paddingTop: tokens.spacing.xl,
          paddingBottom: tokens.spacing.lg,
        }}
      >
        <AivizLogo size={36} />
      </View>
      <View style={{ flex: 1 }}>
        <BottomTabBar {...props} />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const showSidebar = useUseSidebar();

  return (
    <Tabs
      tabBar={(props) => <SidebarTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: showSidebar ? "left" : "bottom",
        tabBarLabelPosition: showSidebar ? "beside-icon" : undefined,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: showSidebar
          ? {
              width: SIDEBAR_WIDTH,
              backgroundColor: colors.bg,
              borderRightWidth: 0,
              borderTopWidth: 0,
            }
          : {
              backgroundColor: colors.bg,
              borderTopColor: "rgba(31,190,214,0.18)",
            },
        tabBarItemStyle: showSidebar
          ? {
              justifyContent: "flex-start",
              paddingHorizontal: 16,
              height: 52,
              marginVertical: 2,
              marginHorizontal: 12,
              borderRadius: tokens.radii.md,
            }
          : undefined,
        tabBarLabelStyle: showSidebar
          ? { fontSize: tokens.fontSize.md, fontWeight: "600", marginLeft: 8 }
          : undefined,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, color }) => (
            <SidebarIcon emoji="📊" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription/index"
        options={{
          title: "Subscription",
          tabBarIcon: ({ focused, color }) => (
            <SidebarIcon emoji="💳" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <SidebarIcon emoji="👤" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "AI Tools",
          tabBarIcon: ({ focused, color }) => (
            <SidebarIcon emoji="🤖" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library/index"
        options={{
          title: "Library",
          tabBarIcon: ({ focused, color }) => (
            <SidebarIcon emoji="📁" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logout/index"
        options={{
          title: "Logout",
          tabBarIcon: ({ focused, color }) => (
            <SidebarIcon emoji="🚪" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="profile/billing" options={{ href: null }} />
      <Tabs.Screen name="profile/payment-history" options={{ href: null }} />
    </Tabs>
  );
}
