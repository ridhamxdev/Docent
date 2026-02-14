import { View, Text, TextInput, TouchableOpacity, Image, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';

interface PostModalProps {
    visible: boolean;
    onClose: () => void;
    onPostSuccess: () => void;
}

export default function PostModal({ visible, onClose, onPostSuccess }: PostModalProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSensitiveContent, setIsSensitiveContent] = useState(false);

    const pickMedia = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled) {
                setMedia(prev => [...prev, ...result.assets]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to pick media');
        }
    };

    const removeMedia = (index: number) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        if (!content.trim() && media.length === 0) return;
        if (loading) {
            console.log('⚠️ Post already in progress, ignoring duplicate call');
            return; // Prevent double submission
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('author', user?.displayName || 'User');
            formData.append('userId', user?.uid || '');
            formData.append('authorType', 'user');
            formData.append('authorRole', user?.role || 'patient');
            formData.append('isSensitiveContent', isSensitiveContent.toString());

            media.forEach((asset, index) => {
                const uri = asset.uri;
                const filename = uri.split('/').pop() || `file_${index}`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                // React Native FormData requires specific format for files
                // @ts-ignore
                formData.append('files', {
                    uri,
                    name: filename,
                    type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg' // Simplified type inference
                });
            });

            // Don't manually set Content-Type - let the system set it with boundary
            const response = await apiClient.post('/posts', formData);
            console.log('✅ Post created successfully:', response);

            setContent('');
            setMedia([]);
            setIsSensitiveContent(false);

            console.log('📢 Calling onPostSuccess to refresh feed...');
            onPostSuccess();
            onClose();

        } catch (error) {
            console.error('❌ Post failed', error);
            Alert.alert('Error', 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-white pt-4">
                {/* Header */}
                <View className="flex-row justify-between items-center px-4 mb-4 border-b border-gray-100 pb-3">
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-gray-500 text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="font-bold text-lg">New Post</Text>
                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={loading || (!content.trim() && media.length === 0)}
                    >
                        <Text className={`font-bold text-lg ${loading || (!content.trim() && media.length === 0) ? 'text-gray-300' : 'text-blue-600'}`}>
                            {loading ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4">
                    <View className="flex-row gap-3 mb-4">
                        <Image
                            source={{ uri: user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}` }}
                            className="w-10 h-10 rounded-full bg-gray-200"
                        />
                        <View>
                            <Text className="font-bold">{user?.displayName}</Text>
                            <Text className="text-xs text-gray-500 capitalize">{user?.role}</Text>
                        </View>
                    </View>

                    <TextInput
                        placeholder="What's on your mind?"
                        multiline
                        className="text-lg text-gray-900 min-h-[100px]"
                        textAlignVertical="top"
                        value={content}
                        onChangeText={setContent}
                    />

                    {/* Media Previews */}
                    <View className="flex-row flex-wrap gap-2 mt-4">
                        {media.map((item, index) => (
                            <View key={index} className="relative">
                                <Image source={{ uri: item.uri }} className="w-24 h-24 rounded-lg bg-gray-100" />
                                <TouchableOpacity
                                    onPress={() => removeMedia(index)}
                                    className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1"
                                >
                                    <Ionicons name="close" size={16} color="black" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Sensitive Content Checkbox (Dentists and Students only) */}
                    {(user?.role === 'dentist' || user?.role === 'student') && (
                        <TouchableOpacity
                            onPress={() => setIsSensitiveContent(!isSensitiveContent)}
                            className="flex-row items-center gap-3 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200"
                        >
                            <Ionicons
                                name={isSensitiveContent ? "checkbox" : "square-outline"}
                                size={24}
                                color={isSensitiveContent ? "#F59E0B" : "#9CA3AF"}
                            />
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-gray-900">Contains sensitive medical content</Text>
                                <Text className="text-xs text-gray-600">Blood, serious treatment, or graphic medical content</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {/* Footer Actions */}
                <View className="p-4 border-t border-gray-100 flex-row gap-6 pb-8">
                    <TouchableOpacity onPress={pickMedia} className="flex-row items-center gap-2">
                        <Ionicons name="images-outline" size={24} color="#3B82F6" />
                        <Text className="text-blue-600 font-medium">Photo/Video</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center gap-2">
                        <Ionicons name="camera-outline" size={24} color="#3B82F6" />
                        <Text className="text-blue-600 font-medium">Camera</Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View className="absolute inset-0 bg-black/20 justify-center items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}
            </View>
        </Modal>
    );
}
