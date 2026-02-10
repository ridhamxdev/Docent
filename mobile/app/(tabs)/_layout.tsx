import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    elevation: 10, // Android shadow
                    shadowColor: '#000', // iOS shadow
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 65,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: "black",
                tabBarInactiveTintColor: "#9CA3AF", // gray-400
            }}
        >
            <Tabs.Screen
                name="feed"
                options={{
                    title: "Feed",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "home" : "home-outline"} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "search" : "search-outline"} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="study"
                options={{
                    title: "Study",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "book" : "book-outline"} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="shop"
                options={{
                    title: "Shop",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "cart" : "cart-outline"} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
