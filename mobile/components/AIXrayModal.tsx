import { View, Text, Modal, TouchableOpacity, TextInput, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../lib/apiClient';

interface AIXrayModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AIXrayModal({ visible, onClose }: AIXrayModalProps) {
    const [image, setImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photos to upload X-rays.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            setImage(result.assets[0].uri);
            setAnalysis(null); // Reset previous analysis
        }
    };

    const analyzeXray = async () => {
        if (!image) {
            Alert.alert('No Image', 'Please select an X-ray image first.');
            return;
        }

        setLoading(true);
        try {
            // Convert image to base64
            const response = await fetch(image);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = async () => {
                const base64data = reader.result as string;

                // Call backend API
                const result = await apiClient.post('/ai/analyze-xray', {
                    image: base64data,
                    prompt: prompt || 'Analyze this dental X-ray and provide diagnostic insights.',
                });

                setAnalysis(result.analysis);
            };

            reader.readAsDataURL(blob);
        } catch (error: any) {
            Alert.alert('Analysis Failed', error.message || 'Failed to analyze X-ray. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setImage(null);
        setPrompt('');
        setAnalysis(null);
        setLoading(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50">
                <View className="flex-1 mt-20 bg-white rounded-t-3xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
                        <View className="flex-row items-center gap-2">
                            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="sparkles" size={20} color="#2563eb" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">AI X-ray Analysis</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} className="w-10 h-10 items-center justify-center">
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                        {/* Image Selection */}
                        <TouchableOpacity
                            onPress={pickImage}
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 items-center justify-center bg-gray-50 mb-5"
                            style={{ minHeight: 200 }}
                        >
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-48 rounded-xl" resizeMode="contain" />
                            ) : (
                                <View className="items-center">
                                    <Ionicons name="image-outline" size={48} color="#9ca3af" />
                                    <Text className="text-gray-500 mt-3 font-medium">Tap to select X-ray image</Text>
                                    <Text className="text-gray-400 text-xs mt-1">Supports JPG, PNG</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {image && (
                            <TouchableOpacity
                                onPress={pickImage}
                                className="mb-5 flex-row items-center justify-center gap-2 py-2"
                            >
                                <Ionicons name="refresh" size={16} color="#2563eb" />
                                <Text className="text-blue-600 font-semibold">Change Image</Text>
                            </TouchableOpacity>
                        )}

                        {/* Prompt Input */}
                        <View className="mb-5">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">
                                Additional Instructions (Optional)
                            </Text>
                            <TextInput
                                className="bg-gray-50 rounded-xl p-4 text-gray-900 border border-gray-200"
                                placeholder="e.g., Focus on the upper molars, check for cavities..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={3}
                                value={prompt}
                                onChangeText={setPrompt}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Analyze Button */}
                        <TouchableOpacity
                            onPress={analyzeXray}
                            disabled={!image || loading}
                            className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 mb-5 ${!image || loading ? 'bg-gray-300' : 'bg-blue-600'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <ActivityIndicator color="white" />
                                    <Text className="text-white font-bold text-base">Analyzing...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={20} color="white" />
                                    <Text className="text-white font-bold text-base">Analyze X-ray</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Analysis Results */}
                        {analysis && (
                            <View className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                                <View className="flex-row items-center gap-2 mb-3">
                                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                                    <Text className="text-blue-900 font-bold text-base">Analysis Results</Text>
                                </View>
                                <Text className="text-gray-800 leading-6">{analysis}</Text>

                                <View className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <View className="flex-row items-start gap-2">
                                        <Ionicons name="warning" size={16} color="#f59e0b" />
                                        <Text className="text-yellow-800 text-xs flex-1">
                                            This AI analysis is for reference only. Always consult with qualified professionals for medical decisions.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
