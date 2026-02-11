import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <AuthProvider>
                    <View className="flex-1 bg-white">
                        <Stack screenOptions={{ headerShown: false }} />
                        <StatusBar style="auto" />
                    </View>
                </AuthProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
