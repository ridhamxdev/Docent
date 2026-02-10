import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface User {
    bio?: string | null;
    qualifications?: string | null;
    specialization?: string | null;
    practiceType?: string | null;
    displayName?: string | null;
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
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiClient.put('/users/profile', formData);
            // Also update AuthContext if possible, but here we callback
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

                <ScrollView className="p-4">
                    <Text className="font-semibold mb-2">Name</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4"
                        value={formData.displayName}
                        onChangeText={t => setFormData({ ...formData, displayName: t })}
                    />

                    <Text className="font-semibold mb-2">Bio</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 h-24"
                        placeholder="Tell us about yourself..."
                        multiline
                        textAlignVertical="top"
                        value={formData.bio}
                        onChangeText={t => setFormData({ ...formData, bio: t })}
                    />

                    <Text className="font-semibold mb-2">Qualification</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4"
                        placeholder="e.g. BDS, MDS"
                        value={formData.qualifications}
                        onChangeText={t => setFormData({ ...formData, qualifications: t })}
                    />

                    <Text className="font-semibold mb-2">Specialization</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4"
                        placeholder="e.g. Orthodontist"
                        value={formData.specialization}
                        onChangeText={t => setFormData({ ...formData, specialization: t })}
                    />

                    <Text className="font-semibold mb-2">Practice Type</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4"
                        placeholder="e.g. Private Clinic"
                        value={formData.practiceType}
                        onChangeText={t => setFormData({ ...formData, practiceType: t })}
                    />

                </ScrollView>
            </View>
        </Modal>
    );
}
