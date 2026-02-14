import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        checkNotificationStatus();
    }, []);

    const checkNotificationStatus = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(status === 'granted');
    };

    const toggleNotifications = async (value: boolean) => {
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setNotificationsEnabled(true);
            } else {
                Alert.alert(
                    "Permission Required",
                    "Please enable notifications in your system settings.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Open Settings", onPress: () => Linking.openSettings() }
                    ]
                );
                setNotificationsEnabled(false);
            }
        } else {
            Alert.alert(
                "Disable Notifications",
                "To fully disable notifications, please go to your device settings.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Open Settings", onPress: () => Linking.openSettings() }
                ]
            );
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace('/welcome');
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-900">
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={isDarkMode ? "white" : "#0f172a"} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">Settings</Text>
                </View>

                <ScrollView className="flex-1 p-6">
                    {/* Account Section */}
                    <Text className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Account</Text>
                    <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <TouchableOpacity onPress={() => router.push('/profile/edit')} className="flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
                                    <Feather name="user" size={16} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                                </View>
                                <Text className="text-slate-700 dark:text-slate-200 font-medium">Edit Profile</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/settings/security')} className="flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
                                    <Feather name="shield" size={16} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                                </View>
                                <Text className="text-slate-700 dark:text-slate-200 font-medium">Security & Privacy</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                    </View>

                    {/* Preferences Section */}
                    <Text className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Preferences</Text>
                    <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <View className="flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
                                    <Feather name="moon" size={16} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                                </View>
                                <Text className="text-slate-700 dark:text-slate-200 font-medium">Dark Mode</Text>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                            />
                        </View>

                        <View className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
                                    <Feather name="bell" size={16} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                                </View>
                                <Text className="text-slate-700 dark:text-slate-200 font-medium">Notifications</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={toggleNotifications}
                                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                            />
                        </View>
                    </View>

                    {/* Support Section */}
                    <Text className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Support</Text>
                    <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <TouchableOpacity onPress={() => router.push('/settings/help')} className="flex-row items-center justify-between p-4 border-b border-slate-50 dark:border-slate-700">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
                                    <Feather name="help-circle" size={16} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                                </View>
                                <Text className="text-slate-700 dark:text-slate-200 font-medium">Help Center</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/settings/about')} className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
                                    <Feather name="info" size={16} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                                </View>
                                <Text className="text-slate-700 dark:text-slate-200 font-medium">About Docent</Text>
                            </View>
                            <Text className="text-slate-400 text-xs">v1.0.0</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Logout */}
                    <TouchableOpacity onPress={handleLogout} className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 flex-row items-center justify-center mb-8 border border-rose-100 dark:border-rose-900/50">
                        <Feather name="log-out" size={20} color="#e11d48" />
                        <Text className="text-rose-600 dark:text-rose-400 font-bold ml-2">Log Out</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
