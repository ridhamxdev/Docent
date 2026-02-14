import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface PermissionRequestModalProps {
    visible: boolean;
    onClose: () => void;
    patientId: string;
    dentistId: string;
    onSuccess: () => void;
}

export default function PermissionRequestModal({ visible, onClose, patientId, dentistId, onSuccess }: PermissionRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [fileType, setFileType] = useState<'image' | 'pdf' | 'other'>('image');

    const handleRequest = async () => {
        setLoading(true);
        try {
            const permission = await apiClient.post('/permissions', {
                patientId,
                dentistId,
                fileType,
                status: 'pending'
            }) as { id: string };

            // Send notification message
            await apiClient.post('/messages', {
                senderId: patientId,
                receiverId: dentistId,
                content: `🔒 Requested permission to upload a ${fileType}`,
                type: 'message',
                metadata: {
                    type: 'permission_request',
                    permissionId: permission.id
                }
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to request permission", error);
            alert("Failed to request permission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl p-6">
                    <Text className="text-xl font-bold text-gray-900 mb-6">Request Upload Permission</Text>

                    <Text className="text-gray-500 mb-3">What constraints do you need for this upload?</Text>

                    <View className="flex-row space-x-4 mb-8 gap-4">
                        {['image', 'pdf', 'other'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setFileType(type as any)}
                                className={`flex-1 p-4 rounded-xl items-center border ${fileType === type ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-200'}`}
                            >
                                <Ionicons
                                    name={type === 'image' ? 'image-outline' : type === 'pdf' ? 'document-text-outline' : 'folder-outline'}
                                    size={24}
                                    color={fileType === type ? '#2563EB' : 'gray'}
                                />
                                <Text className={`mt-2 font-medium capitalize ${fileType === type ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 bg-gray-100 p-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-900 font-bold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 bg-blue-600 p-4 rounded-xl items-center ${loading ? 'opacity-70' : ''}`}
                            onPress={handleRequest}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="white" /> : (
                                <Text className="text-white font-bold">Request</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
