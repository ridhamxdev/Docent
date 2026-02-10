import { View, Text, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import DoctorForm from '../../components/registration/DoctorForm';
import StudentForm from '../../components/registration/StudentForm';
import PatientForm from '../../components/registration/PatientForm';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingScreen() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace('/');
        }
    }, [user]);

    if (!user) return null;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="p-6 flex-grow">
                    <View className="mb-8 mt-4">
                        <Text className="text-3xl font-extrabold text-gray-900">Complete Profile</Text>
                        <Text className="text-gray-500 mt-2">
                            Join Docent as a <Text className="font-bold uppercase text-blue-600">{user.role}</Text>
                        </Text>
                    </View>

                    <View className="bg-white rounded-xl">
                        {user.role === 'doctor' && <DoctorForm />}
                        {user.role === 'student' && <StudentForm />}
                        {user.role === 'patient' && <PatientForm />}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
