import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900">About Docent</Text>
                </View>
                <ScrollView className="p-6 items-center">
                    <View className="w-24 h-24 bg-rose-500 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-rose-200">
                        <Text className="text-4xl text-white font-extrabold tracking-tighter">Do.</Text>
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 mb-2">Docent</Text>
                    <Text className="text-gray-500 mb-8">Version 1.0.0</Text>
                    <Text className="text-gray-600 text-center leading-6">
                        Docent is a platform connecting dental professionals, students, and patients.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
