import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { apiClient } from '../../lib/apiClient';

export default function RoleUpgradeScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [selectedRole, setSelectedRole] = useState<'dentist' | 'student' | null>(null);
    const [loading, setLoading] = useState(false);

    // Dentist Fields
    const [qualification, setQualification] = useState('');
    const [experience, setExperience] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [clinicAddress, setClinicAddress] = useState('');
    const [consultationFee, setConsultationFee] = useState('');

    // Student Fields
    const [collegeName, setCollegeName] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');

    // Document Upload
    const [document, setDocument] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            if (result.canceled) return;
            setDocument(result.assets[0]);
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleUpgrade = async () => {
        if (!selectedRole) return;

        // Validation
        if (selectedRole === 'dentist') {
            if (!qualification || !specialization || !document) {
                Alert.alert("Missing Information", "Please fill in all required fields and upload your verification document.");
                return;
            }
        } else if (selectedRole === 'student') {
            if (!collegeName || !yearOfStudy || !document) {
                Alert.alert("Missing Information", "Please fill in all required fields and upload your student ID.");
                return;
            }
        }

        setLoading(true);
        try {
            let documentUrl = '';

            // Upload Document
            if (document) {
                const uploadFile = {
                    uri: document.uri,
                    name: document.name,
                    type: document.mimeType || 'application/pdf',
                };
                const res = await apiClient.upload(uploadFile, 'verification');
                documentUrl = res.url;
            }

            const updateData: any = {
                role: selectedRole,
                isVerified: false, // All upgrades need verification
                documentUrl,
            };

            if (selectedRole === 'dentist') {
                updateData.qualification = qualification;
                updateData.qualifications = qualification;
                updateData.experience = experience;
                updateData.specialization = specialization;
                updateData.clinicName = clinicName;
                updateData.clinicAddress = clinicAddress;
                if (consultationFee) {
                    updateData.consultationFee = parseInt(consultationFee, 10);
                }
            } else {
                updateData.collegeName = collegeName;
                updateData.yearOfStudy = yearOfStudy;
                updateData.qualifications = `${yearOfStudy} Year Student at ${collegeName}`;
            }

            await updateProfile(updateData);

            Alert.alert(
                "Application Submitted",
                "Your profile is under review. You will be notified once verified.",
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

                    <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

                        {/* Dentist Form */}
                        {selectedRole === 'dentist' && (
                            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                <Text className="font-bold text-lg text-slate-900 mb-4">Dentist Details</Text>

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Qualification *</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. BDS, MDS"
                                    placeholderTextColor="#94a3b8"
                                    value={qualification}
                                    onChangeText={setQualification}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Specialization *</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. Orthodontist"
                                    placeholderTextColor="#94a3b8"
                                    value={specialization}
                                    onChangeText={setSpecialization}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Years of Experience</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. 5"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={experience}
                                    onChangeText={setExperience}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Clinic Name</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. Smile Dental Clinic"
                                    placeholderTextColor="#94a3b8"
                                    value={clinicName}
                                    onChangeText={setClinicName}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Clinic Address</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. 123 Main St, City"
                                    placeholderTextColor="#94a3b8"
                                    value={clinicAddress}
                                    onChangeText={setClinicAddress}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Consultation Fee (₹)</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. 500"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={consultationFee}
                                    onChangeText={setConsultationFee}
                                />

                                {/* Document Upload */}
                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Upload Medical License / ID *</Text>
                                <TouchableOpacity
                                    onPress={pickDocument}
                                    className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 items-center justify-center"
                                >
                                    {document ? (
                                        <View className="items-center">
                                            <Feather name="file-text" size={28} color="#0f172a" />
                                            <Text className="text-slate-900 font-medium mt-2 text-center">{document.name}</Text>
                                            <Text className="text-slate-400 text-xs mt-1">Tap to change</Text>
                                        </View>
                                    ) : (
                                        <View className="items-center">
                                            <Feather name="upload-cloud" size={28} color="#94a3b8" />
                                            <Text className="text-slate-500 mt-2">Tap to upload PDF or Image</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Student Form */}
                        {selectedRole === 'student' && (
                            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                <Text className="font-bold text-lg text-slate-900 mb-4">Student Details</Text>

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">College/University Name *</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. University of Dental Medicine"
                                    placeholderTextColor="#94a3b8"
                                    value={collegeName}
                                    onChangeText={setCollegeName}
                                />

                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Year of Study *</Text>
                                <TextInput
                                    className="bg-slate-50 p-4 rounded-xl text-slate-900 mb-4 border border-slate-200 font-medium"
                                    placeholder="e.g. 3rd Year"
                                    placeholderTextColor="#94a3b8"
                                    value={yearOfStudy}
                                    onChangeText={setYearOfStudy}
                                />

                                {/* Document Upload */}
                                <Text className="text-slate-600 font-medium mb-1.5 ml-1">Upload Student ID Card *</Text>
                                <TouchableOpacity
                                    onPress={pickDocument}
                                    className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 items-center justify-center"
                                >
                                    {document ? (
                                        <View className="items-center">
                                            <Feather name="file-text" size={28} color="#0f172a" />
                                            <Text className="text-slate-900 font-medium mt-2 text-center">{document.name}</Text>
                                            <Text className="text-slate-400 text-xs mt-1">Tap to change</Text>
                                        </View>
                                    ) : (
                                        <View className="items-center">
                                            <Feather name="upload-cloud" size={28} color="#94a3b8" />
                                            <Text className="text-slate-500 mt-2">Tap to upload PDF or Image</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleUpgrade}
                            disabled={!selectedRole || loading}
                            className={`h-14 rounded-2xl flex-row items-center justify-center mt-2 mb-8 shadow-lg ${!selectedRole || loading ? 'bg-slate-300' : 'bg-rose-500 shadow-rose-200'}`}
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
