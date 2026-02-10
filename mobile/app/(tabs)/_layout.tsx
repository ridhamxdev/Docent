import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: "#2563EB", headerShown: false }}>
            <Tabs.Screen
                name="feed"
                options={{
                    title: "Feed",
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="study"
                options={{
                    title: "Study",
                    tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="shop"
                options={{
                    title: "Shop",
                    tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
