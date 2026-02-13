import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { apiClient } from '../../lib/apiClient';

export default function CompleteProfileScreen() {
    const { role } = useLocalSearchParams<{ role: 'dentist' | 'student' | 'patient' }>();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    // Form States
    const [qualification, setQualification] = useState('');
    const [experience, setExperience] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [college, setCollege] = useState('');
    const [year, setYear] = useState('');
    const [document, setDocument] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;
            setDocument(result.assets[0]);
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleSubmit = async () => {
        if (!auth.currentUser) return;

        // Validation
        if (role === 'dentist') {
            if (!qualification || !experience || !document) {
                Alert.alert('Error', 'Please fill all fields and upload verification document');
                return;
            }
        } else if (role === 'student') {
            if (!college || !year || !document) {
                Alert.alert('Error', 'Please fill all fields and upload ID card');
                return;
            }
        }

        setLoading(true);
        try {
            let documentUrl = '';

            // 1. Upload Document
            if (document) {
                const uploadFile = {
                    uri: document.uri,
                    name: document.name,
                    type: document.mimeType || 'application/pdf',
                };

                const res = await apiClient.upload(uploadFile, 'verification');
                documentUrl = res.url;
            }

            // 2. Prepare User Data
            const userData: any = {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName,
                photoURL: auth.currentUser.photoURL,
                role: role,
                isVerified: false, // Pending verification
                isOnboarded: false,
                createdAt: new Date().toISOString(),
                documentUrl,
            };

            if (role === 'dentist') {
                userData.qualification = qualification;
                userData.experience = experience;
                userData.clinicName = clinicName;
            } else if (role === 'student') {
                userData.college = college;
                userData.year = year;
            }

            // 3. Save to Firestore
            await setDoc(doc(db, "users", auth.currentUser.uid), userData);

            Alert.alert(
                'Profile Submitted',
                'Your profile is under review. You will be notified once verified.',
                [
                    { text: 'OK', onPress: () => router.replace('/onboarding') }
                ]
            );

        } catch (error: any) {
            console.error('Registration Error:', error);
            Alert.alert('Error', error.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={{ padding: 24 }}>

                <Text className="text-2xl font-bold text-slate-900 mb-2">
                    Complete Your Profile
                </Text>
                <Text className="text-slate-500 mb-8">
                    {role === 'dentist'
                        ? 'Please provide your professional details for verification.'
                        : 'Please provide your academic details for verification.'}
                </Text>

                <View className="gap-5">

                    {role === 'dentist' && (
                        <>
                            <View>
                                <Text className="text-slate-700 font-medium mb-2">Qualification</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                                    placeholder="e.g. BDS, MDS"
                                    value={qualification}
                                    onChangeText={setQualification}
                                />
                            </View>

                            <View>
                                <Text className="text-slate-700 font-medium mb-2">Years of Experience</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                                    placeholder="e.g. 5"
                                    keyboardType="numeric"
                                    value={experience}
                                    onChangeText={setExperience}
                                />
                            </View>

                            <View>
                                <Text className="text-slate-700 font-medium mb-2">Clinic Name (Optional)</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                                    placeholder="Clinic Name"
                                    value={clinicName}
                                    onChangeText={setClinicName}
                                />
                            </View>
                        </>
                    )}

                    {role === 'student' && (
                        <>
                            <View>
                                <Text className="text-slate-700 font-medium mb-2">College Name</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                                    placeholder="University/College Name"
                                    value={college}
                                    onChangeText={setCollege}
                                />
                            </View>

                            <View>
                                <Text className="text-slate-700 font-medium mb-2">Year of Study</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900"
                                    placeholder="e.g. 3rd Year"
                                    value={year}
                                    onChangeText={setYear}
                                />
                            </View>
                        </>
                    )}

                    {/* File Upload Section */}
                    <View>
                        <Text className="text-slate-700 font-medium mb-2">
                            {role === 'dentist' ? 'Upload Medical License / ID' : 'Upload Student ID Card'}
                        </Text>
                        <TouchableOpacity
                            onPress={pickDocument}
                            className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 items-center justify-center"
                        >
                            {document ? (
                                <View className="items-center">
                                    <Feather name="file-text" size={32} color="#0f172a" />
                                    <Text className="text-slate-900 font-medium mt-2">{document.name}</Text>
                                    <Text className="text-slate-500 text-xs">Tap to change</Text>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <Feather name="upload-cloud" size={32} color="#94a3b8" />
                                    <Text className="text-slate-500 mt-2">Tap to upload PDF or Image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 h-14 rounded-xl items-center justify-center mt-4 shadow-sm"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Submit for Verification</Text>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
