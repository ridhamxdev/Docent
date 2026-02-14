import { View, Text, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface VideoLinkModalProps {
    visible: boolean;
    onClose: () => void;
    meetingId: string;
    onSuccess: (url: string) => void;
}

export default function VideoLinkModal({ visible, onClose, meetingId, onSuccess }: VideoLinkModalProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!url.trim()) return;
        setLoading(true);
        try {
            await apiClient.post(`/meetings/${meetingId}/start`, {
                videoUrl: url.trim()
            });

            // Send chat message with link
            // We need senderId/receiverId. Passed as props or context?
            // meetingId usually implies we know the context. 
            // Probably better to pass onSuccess(url) and let parent handle message sending
            // But let's check what we have. 
            // We don't have sender/receiver props here.
            // Let's pass onSuccess(url) and handle message in [id].tsx

            onSuccess(url.trim());
            onClose();
        } catch (error) {
            console.error("Failed to start meeting", error);
            alert("Failed to start meeting");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center p-4">
                <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Start Video Call</Text>
                    <Text className="text-gray-500 mb-4">Enter the meeting link (e.g., Google Meet, Zoom)</Text>

                    <TextInput
                        className="bg-gray-100 p-3 rounded-xl text-base mb-6 border border-gray-200"
                        placeholder="https://meet.google.com/..."
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View className="flex-row justify-end space-x-3 gap-3">
                        <TouchableOpacity onPress={onClose} className="p-3">
                            <Text className="text-gray-500 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`bg-blue-600 px-6 py-3 rounded-xl ${loading ? 'opacity-70' : ''}`}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text className="text-white font-bold">{loading ? 'Starting...' : 'Start Call'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
