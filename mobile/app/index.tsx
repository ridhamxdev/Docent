import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function LandingPage() {
    return (
        <View className="flex-1 items-center justify-center bg-gray-50 px-4">
            <Text className="text-4xl font-extrabold text-blue-900 mb-2">
                Welcome to <Text className="text-blue-600">Docent</Text>
            </Text>
            <Text className="text-lg text-gray-600 text-center mb-12">
                The all-in-one platform for dentists, students, and patients.
            </Text>

            <View className="w-full max-w-sm gap-6">
                {/* Dentist Card */}
                <Link href="/auth/doctor" asChild>
                    <TouchableOpacity className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center">
                            <Text className="text-2xl">👨‍⚕️</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900">Dentist</Text>
                            <Text className="text-blue-600 text-xs font-bold">VERIFIED ACCESS</Text>
                        </View>
                    </TouchableOpacity>
                </Link>

                {/* Student Card */}
                <Link href="/auth/student" asChild>
                    <TouchableOpacity className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-teal-100 rounded-2xl items-center justify-center">
                            <Text className="text-2xl">🎓</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900">Dental Student</Text>
                            <Text className="text-teal-600 text-xs font-bold">LEARNING HUB</Text>
                        </View>
                    </TouchableOpacity>
                </Link>

                {/* Patient Card */}
                <Link href="/auth/patient" asChild>
                    <TouchableOpacity className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                            <Text className="text-2xl">🤒</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900">Patient</Text>
                            <Text className="text-purple-600 text-xs font-bold">INSTANT CARE</Text>
                        </View>
                    </TouchableOpacity>
                </Link>
            </View>

            <Text className="absolute bottom-10 text-gray-400 text-sm font-medium">
                © 2026 Docent Platform. All rights reserved.
            </Text>
        </View>
    );
}
