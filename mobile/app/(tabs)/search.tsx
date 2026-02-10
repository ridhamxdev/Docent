import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900 mb-4">Search</Text>
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                    <Ionicons name="search" size={20} color="gray" />
                    <TextInput
                        placeholder="Search for doctors, clinics..."
                        className="flex-1 ml-3 text-gray-900"
                        placeholderTextColor="gray"
                    />
                </View>
            </View>

            <View className="flex-1 items-center justify-center p-8">
                <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                    <Ionicons name="search-outline" size={32} color="#CBD5E1" />
                </View>
                <Text className="text-gray-500 text-center">Enter a search term to find what you're looking for.</Text>
            </View>
        </SafeAreaView>
    );
}
