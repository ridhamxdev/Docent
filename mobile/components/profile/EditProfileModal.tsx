import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../lib/apiClient';

interface User {
    bio?: string | null;
    qualifications?: string | null;
    specialization?: string | null;
    practiceType?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    coverPhoto?: string | null;
}

interface Props {
    visible: boolean;
    user: User;
    onClose: () => void;
    onSuccess: (updatedData: User) => void;
}

export default function EditProfileModal({ visible, user, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: user.displayName || '',
        bio: user.bio || '',
        qualifications: user.qualifications || '',
        specialization: user.specialization || '',
        practiceType: user.practiceType || '',
        photoURL: user.photoURL || null,
        coverPhoto: user.coverPhoto || null,
    });

    const pickImage = async (type: 'avatar' | 'cover') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.8,
            base64: true, // Assuming backend accepts base64 or simple URI for now
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
            // NOTE: In a real app, you'd upload images to storage (Firebase Storage/S3) first, 
            // get the URL, then save the URL to the user profile.
            // For now, we are sending the URI (which might work if backend handles it or just for local demo)
            // or base64 if we enabled it.

            await apiClient.put('/users/profile', formData);
            Alert.alert("Success", "Profile updated!");
            onSuccess(formData);
            onClose();
        } catch (error) {
            console.error("Update failed", error);
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-gray-500 text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="font-bold text-lg">Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        <Text className={`font-bold text-lg ${loading ? 'text-gray-300' : 'text-blue-600'}`}>
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                    {/* Image Management Section */}
                    <View className="mb-8">
                        {/* Cover Photo Customization */}
                        <TouchableOpacity onPress={() => pickImage('cover')} className="h-32 rounded-t-xl bg-slate-900 rounded-xl overflow-hidden mb-[-40px] relative items-center justify-center">
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
                        <View className="items-center">
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
                            <TouchableOpacity onPress={() => pickImage('avatar')} className="mt-2">
                                <Text className="text-blue-600 font-semibold text-sm">Change Profile Photo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text className="font-semibold mb-2 mt-4 text-gray-900">Name</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-4 text-gray-900"
                        value={formData.displayName}
                        onChangeText={t => setFormData({ ...formData, displayName: t })}
                    />

                    <Text className="font-semibold mb-2 text-gray-900">Bio</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-4 h-24 text-gray-900"
                        placeholder="Tell us about yourself..."
                        multiline
                        textAlignVertical="top"
                        value={formData.bio}
                        onChangeText={t => setFormData({ ...formData, bio: t })}
                    />

                    <Text className="font-semibold mb-2 text-gray-900">Qualification</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-4 text-gray-900"
                        placeholder="e.g. BDS, MDS"
                        value={formData.qualifications}
                        onChangeText={t => setFormData({ ...formData, qualifications: t })}
                    />

                    <Text className="font-semibold mb-2 text-gray-900">Specialization</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-4 text-gray-900"
                        placeholder="e.g. Orthodontist"
                        value={formData.specialization}
                        onChangeText={t => setFormData({ ...formData, specialization: t })}
                    />

                    <Text className="font-semibold mb-2 text-gray-900">Practice Type</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-4 text-gray-900"
                        placeholder="e.g. Private Clinic"
                        value={formData.practiceType}
                        onChangeText={t => setFormData({ ...formData, practiceType: t })}
                    />

                    <View className="h-10" />
                </ScrollView>
            </View>
        </Modal>
    );
}
