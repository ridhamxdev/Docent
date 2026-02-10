import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function AuthScreen() {
    const { role } = useLocalSearchParams<{ role: string }>();
    const router = useRouter();
    const { login, register, loading } = useAuth(); // Global loading state might be true initially

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState(""); // For signup

    const [localLoading, setLocalLoading] = useState(false);

    // Map role to display name and color
    const roleConfig = {
        doctor: { label: "Dentist", color: "text-blue-600", bg: "bg-blue-600", border: "border-blue-200" },
        student: { label: "Student", color: "text-teal-600", bg: "bg-teal-600", border: "border-teal-200" },
        patient: { label: "Patient", color: "text-purple-600", bg: "bg-purple-600", border: "border-purple-200" },
        admin: { label: "Admin", color: "text-gray-600", bg: "bg-gray-600", border: "border-gray-200" },
    };

    const currentRole = (role as UserRole) || 'patient';
    const config = roleConfig[currentRole] || roleConfig.patient;

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLocalLoading(true);
        try {
            if (isLogin) {
                await login(email, password, currentRole);
            } else {
                await register(email, password, currentRole, { displayName: name });
            }
            // Navigation happens in AuthContext
        } catch (error: any) {
            Alert.alert("Error", error.message || "Authentication failed");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
                <StatusBar style="dark" />

                <View className="items-center mb-8">
                    <Text className="text-4xl font-extrabold text-gray-900 mb-2">Docent</Text>
                    <Text className={`text-xl font-medium ${config.color}`}>
                        {isLogin ? "Login" : "Sign Up"} as {config.label}
                    </Text>
                </View>

                <View className="gap-4 w-full max-w-sm mx-auto">
                    {!isLogin && (
                        <View>
                            <Text className="mb-1 text-gray-600 font-medium">Full Name</Text>
                            <TextInput
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                placeholder="John Doe"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    )}

                    <View>
                        <Text className="mb-1 text-gray-600 font-medium">Email Address</Text>
                        <TextInput
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View>
                        <Text className="mb-1 text-gray-600 font-medium">Password</Text>
                        <TextInput
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {!isLogin && (
                        <View>
                            <Text className="mb-1 text-gray-600 font-medium">Confirm Password</Text>
                            <TextInput
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                placeholder="••••••••"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={localLoading}
                        className={`w-full py-4 rounded-xl mt-4 items-center justify-center ${config.bg} shadow-lg shadow-blue-500/30`}
                    >
                        {localLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                {isLogin ? "Login" : "Create Account"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsLogin(!isLogin)}
                        className="mt-4 items-center"
                    >
                        <Text className="text-gray-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <Text className={`${config.color} font-bold`}>
                                {isLogin ? "Sign Up" : "Login"}
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-8 items-center"
                    >
                        <Text className="text-gray-400 font-medium text-sm">Cancel and go back</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
