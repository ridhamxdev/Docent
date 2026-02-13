import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <View style={{ flex: 1 }}>
                        <Stack screenOptions={{ headerShown: false }} />
                        <StatusBar style="auto" />
                    </View>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
