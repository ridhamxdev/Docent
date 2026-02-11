import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-900">Help Center</Text>
                </View>
                <ScrollView className="p-6">
                    <Text className="text-gray-600">
                        FAQ and Support contact details will be listed here.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
