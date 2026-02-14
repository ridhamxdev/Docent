import { Modal, View, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');

interface ImageViewerModalProps {
    visible: boolean;
    imageUrl: string;
    onClose: () => void;
}

export default function ImageViewerModal({ visible, imageUrl, onClose }: ImageViewerModalProps) {
    const [downloading, setDownloading] = useState(false);

    const downloadImage = async () => {
        setDownloading(true);
        try {
            // Request permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant media library permissions to download images.');
                setDownloading(false);
                return;
            }

            // Download file to cache directory first
            const filename = 'image_' + Date.now() + '.jpg';
            const fileUri = (FileSystem as any).cacheDirectory + filename;
            const downloadResult = await (FileSystem as any).downloadAsync(imageUrl, fileUri);

            // Save to media library
            await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
            Alert.alert('Success', 'Image saved to gallery!');
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download image');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 bg-black">
                {/* Header Bar */}
                <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center p-4 pt-12 bg-black/50">
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-10 h-10 rounded-full bg-gray-800/80 items-center justify-center"
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={downloadImage}
                        disabled={downloading}
                        className="w-10 h-10 rounded-full bg-gray-800/80 items-center justify-center"
                    >
                        {downloading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Ionicons name="download" size={24} color="white" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Image */}
                <View className="flex-1 items-center justify-center">
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: width, height: height }}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </Modal>
    );
}
