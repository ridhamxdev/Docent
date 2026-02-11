import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        bio: user?.bio || '',
        qualifications: user?.qualifications || '',
        specialization: user?.specialization || '',
        practiceType: user?.practiceType || '',
        photoURL: user?.photoURL || null,
        coverPhoto: user?.coverPhoto || null,
    });

    const pickImage = async (type: 'avatar' | 'cover') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            if (type === 'avatar') {
                setFormData({ ...formData, photoURL: result.assets[0].uri });
            } else {
                setFormData({ ...formData, coverPhoto: result.assets[0].uri });
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile({
                ...formData,
                photoURL: formData.photoURL || undefined,
                coverPhoto: formData.coverPhoto || undefined
            });
            Alert.alert("Success", "Profile updated!");
            router.back();
        } catch (error) {
            console.error("Update failed", error);
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <View className="flex-1 bg-white" />;

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-gray-500 text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="font-bold text-lg">Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#2563eb" />
                        ) : (
                            <Text className="font-bold text-lg text-blue-600">Done</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Image Management Section */}
                    <View className="mb-8 relative">
                        {/* Cover Photo Customization */}
                        <TouchableOpacity onPress={() => pickImage('cover')} className="h-40 bg-slate-900 w-full items-center justify-center">
                            {formData.coverPhoto ? (
                                <Image source={{ uri: formData.coverPhoto }} className="w-full h-full opacity-80" resizeMode="cover" />
                            ) : (
                                <View className="items-center justify-center">
                                    <Ionicons name="camera" size={24} color="white" />
                                    <Text className="text-white text-xs mt-1 font-medium">Add Cover Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Avatar Customization */}
                        <View className="absolute -bottom-12 left-0 right-0 items-center">
                            <TouchableOpacity onPress={() => pickImage('avatar')} className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white items-center justify-center overflow-hidden shadow-sm relative z-10">
                                {formData.photoURL ? (
                                    <Image source={{ uri: formData.photoURL }} className="w-full h-full" />
                                ) : (
                                    <Ionicons name="person" size={40} color="gray" />
                                )}
                                <View className="absolute inset-0 bg-black/30 items-center justify-center opacity-0 hover:opacity-100">
                                    <Ionicons name="camera" size={20} color="white" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => pickImage('avatar')} className="mt-2 bg-white/80 px-2 py-1 rounded-full backdrop-blur-md">
                                <Text className="text-blue-600 font-semibold text-xs">Change Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mt-16 px-4 pb-10">
                        <Text className="font-semibold mb-2 text-gray-900">Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 text-gray-900 font-medium"
                            value={formData.displayName}
                            onChangeText={t => setFormData({ ...formData, displayName: t })}
                        />

                        <Text className="font-semibold mb-2 text-gray-900">Bio</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 h-28 text-gray-900 text-base"
                            placeholder="Tell us about yourself..."
                            multiline
                            textAlignVertical="top"
                            value={formData.bio}
                            onChangeText={t => setFormData({ ...formData, bio: t })}
                        />

                        <Text className="font-semibold mb-2 text-gray-900">Qualification</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 text-gray-900"
                            placeholder="e.g. BDS, MDS"
                            value={formData.qualifications}
                            onChangeText={t => setFormData({ ...formData, qualifications: t })}
                        />

                        <Text className="font-semibold mb-2 text-gray-900">Specialization</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 text-gray-900"
                            placeholder="e.g. Orthodontist"
                            value={formData.specialization}
                            onChangeText={t => setFormData({ ...formData, specialization: t })}
                        />

                        <Text className="font-semibold mb-2 text-gray-900">Practice Type</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 text-gray-900"
                            placeholder="e.g. Private Clinic"
                            value={formData.practiceType}
                            onChangeText={t => setFormData({ ...formData, practiceType: t })}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
