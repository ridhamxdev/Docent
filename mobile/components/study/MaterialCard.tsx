import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface StudyMaterial {
    id: string;
    title: string;
    description?: string;
    category: 'books' | 'pyq' | 'notes' | 'ppt';
    fileUrl: string;
    previewUrl?: string;
    author: string;
    uploadDate: number;
    year?: string;
    university?: string;
    subject?: string;
    chapter?: string;
}

const timeAgo = (date: number) => {
    const seconds = Math.floor((Date.now() - date) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + " years";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " seconds";
}

export default function MaterialCard({ material, onDelete }: { material: StudyMaterial, onDelete?: () => void }) {
    const handleOpen = () => {
        if (material.fileUrl) {
            Linking.openURL(material.fileUrl);
        }
    };

    return (
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-col gap-3 mb-4">
            {/* Preview */}
            <View className="h-40 bg-gray-100 rounded-lg items-center justify-center overflow-hidden relative">
                {material.previewUrl ? (
                    <Image source={{ uri: material.previewUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <Text className="text-4xl">📄</Text>
                )}
                <View className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow-sm">
                    <Text className="text-xs font-bold uppercase">{material.category}</Text>
                </View>
            </View>

            {/* Info */}
            <View>
                <Text className="font-bold text-gray-900 text-lg" numberOfLines={1}>{material.title}</Text>
                {material.description && <Text className="text-sm text-gray-500" numberOfLines={2}>{material.description}</Text>}

                {/* Metadata Badges */}
                <View className="flex-row flex-wrap gap-2 mt-2">
                    {material.year && <Text className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded overflow-hidden">{material.year}</Text>}
                    {material.subject && <Text className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded overflow-hidden">{material.subject}</Text>}
                    {material.university && <Text className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded overflow-hidden">{material.university}</Text>}
                </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                    onPress={handleOpen}
                    className="flex-1 bg-teal-600 py-2 rounded-lg items-center justify-center"
                >
                    <Text className="text-white font-semibold">View / Download</Text>
                </TouchableOpacity>

                <TouchableOpacity className="px-3 bg-gray-100 items-center justify-center rounded-lg">
                    <Ionicons name="share-outline" size={20} color="gray" />
                </TouchableOpacity>

                {onDelete && (
                    <TouchableOpacity onPress={onDelete} className="px-3 bg-red-50 items-center justify-center rounded-lg">
                        <Ionicons name="trash-outline" size={20} color="red" />
                    </TouchableOpacity>
                )}
            </View>

            <View className="border-t border-gray-100 pt-2 mt-2 flex-row justify-between">
                <Text className="text-xs text-gray-400">By {material.author}</Text>
                <Text className="text-xs text-gray-400">{timeAgo(material.uploadDate)} ago</Text>
            </View>
        </View>
    );
}
