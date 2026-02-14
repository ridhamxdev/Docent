import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function DentistForm() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        name: user?.displayName || '',
        username: '',
        about: '',
        experience: '',
        qualifications: '',
        clinicAddress: '',
        address: ''
    });
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Error picking document', err);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const uploadFile = async (uri: string, filename: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storage = getStorage();
            const storageRef = ref(storage, `documents/${user?.uid}/${filename}`);
            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Upload failed", error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.name || !form.username || !form.qualifications || !form.experience || !form.clinicAddress || !form.address) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!user?.documentUrl && !file) {
            Alert.alert('Verification Required', 'Please upload your BDS Degree/Medical License for verification.');
            return;
        }

        setLoading(true);

        try {
            let documentUrl = user?.documentUrl;

            // 1. Upload Verification Doc if new file provided
            if (file) {
                documentUrl = await uploadFile(file.uri, file.name);
            }

            // 2. Update Profile
            await updateProfile({
                displayName: form.name,
                username: form.username,
                about: form.about,
                experience: form.experience,
                qualifications: form.qualifications,
                clinicAddress: form.clinicAddress,
                address: form.address,
                isOnboarded: true,
                isVerified: false, // PENDING VERIFICATION
                // @ts-ignore
                documentUrl: documentUrl
            });

            Alert.alert('Success', 'Profile submitted for verification!');
            router.replace('/(tabs)/feed');

        } catch (err: any) {
            console.error(err);
            Alert.alert('Registration failed', err.message || 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="gap-4">
            <View className="flex-row gap-4">
                <View className="flex-1">
                    <Text className="mb-1 text-gray-600 font-medium text-xs">Full Name *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                        placeholder="Dr. John Doe"
                        value={form.name}
                        onChangeText={t => setForm({ ...form, name: t })}
                    />
                </View>
                <View className="flex-1">
                    <Text className="mb-1 text-gray-600 font-medium text-xs">Username *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                        placeholder="johndoe"
                        value={form.username}
                        onChangeText={t => setForm({ ...form, username: t })}
                    />
                </View>
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Bio/About</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="Tell us about yourself..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={form.about}
                    onChangeText={t => setForm({ ...form, about: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Qualifications (e.g. BDS, MDS) *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="BDS, MDS Orthodontics"
                    value={form.qualifications}
                    onChangeText={t => setForm({ ...form, qualifications: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Experience (Years) *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="5"
                    keyboardType="numeric"
                    value={form.experience}
                    onChangeText={t => setForm({ ...form, experience: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Clinic Address *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="123 Dental St, City"
                    value={form.clinicAddress}
                    onChangeText={t => setForm({ ...form, clinicAddress: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Personal Address *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="Home Address"
                    value={form.address}
                    onChangeText={t => setForm({ ...form, address: t })}
                />
            </View>

            {/* Document Upload */}
            {!user?.documentUrl && (
                <TouchableOpacity
                    onPress={pickDocument}
                    className="border-2 border-dashed border-blue-200 bg-blue-50 p-6 rounded-xl items-center mt-2"
                >
                    {file ? (
                        <View className="items-center">
                            <Ionicons name="document-text" size={32} color="#2563EB" />
                            <Text className="text-blue-700 font-medium mt-2">{file.name}</Text>
                            <Text className="text-blue-500 text-xs">Tap to change</Text>
                        </View>
                    ) : (
                        <View className="items-center">
                            <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                            <Text className="text-gray-500 font-medium mt-2">Upload License / Degree</Text>
                            <Text className="text-gray-400 text-xs text-center mt-1">Required for verification</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-500/30 mt-4"
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Complete Registration</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
