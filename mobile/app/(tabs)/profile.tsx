import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
    const { logout, user } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerClassName="pb-8">
                <View className="bg-white p-6 items-center border-b border-gray-200">
                    <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4 overflow-hidden">
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} className="w-full h-full" />
                        ) : (
                            <Text className="text-4xl">👤</Text>
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">{user?.displayName || "User"}</Text>
                    <Text className="text-blue-600 font-medium capitalize">{user?.role || "Patient"}</Text>
                </View>

                <View className="mt-6 px-4 gap-4">
                    <View className="bg-white p-4 rounded-xl border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase font-bold mb-2">Contact Information</Text>
                        <View className="flex-row items-center gap-3 mb-2">
                            <Ionicons name="mail-outline" size={20} color="gray" />
                            <Text className="text-gray-900">{user?.email}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={logout} className="flex-row items-center justify-center bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text className="text-red-500 font-bold ml-2">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
