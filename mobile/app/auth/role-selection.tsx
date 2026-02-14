import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

export default function RoleSelectionScreen() {
    const { user } = useAuth(); // Has firebase auth but maybe no firestore doc yet
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSelectRole = async (role: 'dentist' | 'student' | 'patient') => {
        if (!auth.currentUser) return;

        if (role === 'patient') {
            // Patients don't need verification, create account immediately
            setLoading(true);
            try {
                const userData = {
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    displayName: auth.currentUser.displayName,
                    photoURL: auth.currentUser.photoURL,
                    role: role,
                    isVerified: true, // Patients are auto-verified (or don't need it)
                    isOnboarded: false,
                    createdAt: new Date().toISOString()
                };

                await setDoc(doc(db, "users", auth.currentUser.uid), userData);
                router.replace('/onboarding');
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        } else {
            // dentists and Students need to complete profile
            router.push({
                pathname: '/auth/complete-profile',
                params: { role }
            });
        }
    };

    return (
        <View className="flex-1 bg-white px-6 py-12 justify-center">
            <Text className="text-3xl font-extrabold text-gray-900 mb-2">
                Select your Role
            </Text>
            <Text className="text-gray-500 mb-10 text-lg">
                Tell us how you'll be using Docent.
            </Text>

            <View className="gap-4">
                <TouchableOpacity
                    onPress={() => handleSelectRole('dentist')}
                    className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex-row items-center gap-4"
                >
                    <View className="bg-blue-100 p-3 rounded-xl">
                        <Text className="text-2xl">👨‍⚕️</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">Health Professional</Text>
                        <Text className="text-gray-500">I am a verified dentist</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleSelectRole('student')}
                    className="p-6 bg-teal-50 border border-teal-100 rounded-2xl flex-row items-center gap-4"
                >
                    <View className="bg-teal-100 p-3 rounded-xl">
                        <Text className="text-2xl">🎓</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">Dental Student</Text>
                        <Text className="text-gray-500">I am currently studying</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleSelectRole('patient')}
                    className="p-6 bg-purple-50 border border-purple-100 rounded-2xl flex-row items-center gap-4"
                >
                    <View className="bg-purple-100 p-3 rounded-xl">
                        <Text className="text-2xl">🤒</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">Patient</Text>
                        <Text className="text-gray-500">I am looking for care</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
