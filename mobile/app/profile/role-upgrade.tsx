import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useState } from 'react';

export default function RoleUpgradeScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [selectedRole, setSelectedRole] = useState<'dentist' | 'student' | null>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [licenseNumber, setLicenseNumber] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');

    const handleUpgrade = async () => {
        if (!selectedRole) return;

        // Validation
        if (selectedRole === 'dentist') {
            if (!licenseNumber || !specialization) {
                Alert.alert("Missing Information", "Please fill in all fields.");
                return;
            }
        } else if (selectedRole === 'student') {
            if (!collegeName || !yearOfStudy) {
                Alert.alert("Missing Information", "Please fill in all fields.");
                return;
            }
        }

        setLoading(true);
        try {
            const updateData: any = {
                role: selectedRole,
                isVerified: selectedRole === 'dentist' ? false : true, // Dentists need verification
            };

            if (selectedRole === 'dentist') {
                updateData.licenseNumber = licenseNumber; // Note: Ensure User type supports this or put in 'qualifications'
                updateData.specialization = specialization;
                updateData.qualifications = licenseNumber; // Using existing field for now
            } else {
                updateData.collegeName = collegeName;
                updateData.yearOfStudy = yearOfStudy;
                updateData.qualifications = `${yearOfStudy} Year Student at ${collegeName}`;
            }

            await updateProfile(updateData);

            Alert.alert(
                "Success",
                selectedRole === 'dentist' ? "Profile updated! Your verification is pending." : "Profile updated!",
                [{ text: "OK", onPress: () => router.back() }]
            );

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="dark" />
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                    {/* Header */}
                    <View className="flex-row items-center px-6 py-4 bg-white border-b border-slate-100">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="#0f172a" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-slate-900">Become a Professional</Text>
                    </View>

                    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                        <Text className="text-slate-500 mb-8 text-base leading-6">
                            Join Docent as a Dentist or Student to access exclusive features, manage appointments, and connect with patients.
                        </Text>

                        {/* Role Selection */}
                        <Text className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Select Role</Text>
                        <View className="flex-row gap-4 mb-8">
                            <TouchableOpacity
                                onPress={() => setSelectedRole('dentist')}
                                className={`flex-1 p-4 rounded-2xl border-2 ${selectedRole === 'dentist' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}
                            >
                                <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                                    <Text className="text-xl">👨‍⚕️</Text>
                                </View>
                                <Text className={`font-bold text-lg ${selectedRole === 'dentist' ? 'text-blue-900' : 'text-slate-900'}`}>Dentist</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setSelectedRole('student')}
                                className={`flex-1 p-4 rounded-2xl border-2 ${selectedRole === 'student' ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white'}`}
                            >
                                <View className="bg-teal-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                                    <Text className="text-xl">🎓</Text>
                                </View>
                                <Text className={`font-bold text-lg ${selectedRole === 'student' ? 'text-teal-900' : 'text-slate-900'}`}>Student</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Forms */}
                        {selectedRole === 'dentist' && (
                            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                <Text className="font-bold text-lg text-slate-900 mb-4">Dentist Details</Text>

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">License Number</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. D-12345"
                                    placeholderTextColor="#94a3b8"
                                    value={licenseNumber}
                                    onChangeText={setLicenseNumber}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Specialization</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-2 border border-slate-200 font-medium"
                                    placeholder="e.g. Orthodontist"
                                    placeholderTextColor="#94a3b8"
                                    value={specialization}
                                    onChangeText={setSpecialization}
                                />
                            </View>
                        )}

                        {selectedRole === 'student' && (
                            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                <Text className="font-bold text-lg text-slate-900 mb-4">Student Details</Text>

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">College/University Name</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. University of Dental Medicine"
                                    placeholderTextColor="#94a3b8"
                                    value={collegeName}
                                    onChangeText={setCollegeName}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Year of Study</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-2 border border-slate-200 font-medium"
                                    placeholder="e.g. 3rd Year"
                                    placeholderTextColor="#94a3b8"
                                    value={yearOfStudy}
                                    onChangeText={setYearOfStudy}
                                />
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleUpgrade}
                            disabled={!selectedRole || loading}
                            className={`h-14 rounded-2xl flex-row items-center justify-center mt-2 shadow-lg ${!selectedRole || loading ? 'bg-slate-300' : 'bg-rose-500 shadow-rose-200'}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-lg font-bold tracking-wide">
                                    {selectedRole ? 'Submit Application' : 'Select a Role'}
                                </Text>
                            )}
                        </TouchableOpacity>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
