import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
    displayName?: string | null;
    photoURL?: string | null;
    coverPhoto?: string | null;
    role?: string;
    bio?: string;
    qualifications?: string;
    specialization?: string;
    isVerified?: boolean;
}

interface Props {
    user: User;
    isOwner?: boolean;
    onEdit?: () => void;
    onMenu?: () => void;
}

export default function ProfileHeader({ user, isOwner, onEdit, onMenu }: Props) {
    return (
        <View className="mb-4">
            {/* Cover Photo */}
            <View className="h-40 relative bg-gray-200">
                {user.coverPhoto ? (
                    <Image source={{ uri: user.coverPhoto }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <LinearGradient
                        colors={['#4facfe', '#00f2fe']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="w-full h-full"
                    />
                )}

                {/* Menu Button */}
                {isOwner && (
                    <TouchableOpacity
                        onPress={onMenu}
                        className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-2 rounded-full"
                    >
                        <Ionicons name="menu" size={24} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Profile Info */}
            <View className="px-4 -mt-12 flex-row items-end">
                {/* Avatar */}
                <View className="w-24 h-24 rounded-2xl bg-gray-100 border-4 border-white overflow-hidden shadow-sm">
                    {user.photoURL ? (
                        <Image source={{ uri: user.photoURL }} className="w-full h-full" />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-gray-200">
                            <Ionicons name="person" size={40} color="gray" />
                        </View>
                    )}
                </View>

                {/* Edit Button */}
                {isOwner && (
                    <TouchableOpacity
                        onPress={onEdit}
                        className="ml-auto mb-2 bg-gray-100 p-2 rounded-full border border-gray-200"
                    >
                        <Ionicons name="pencil" size={20} color="#374151" />
                    </TouchableOpacity>
                )}
            </View>

            {/* details */}
            <View className="px-4 mt-3">
                <Text className="text-2xl font-bold text-gray-900 flex-row items-center">
                    {user.displayName || 'User'}
                    {user.isVerified && <Text className="text-blue-500 text-lg"> ✓</Text>}
                </Text>

                {user.role !== 'patient' && (
                    <Text className="text-gray-500 text-sm font-medium">
                        {user.qualifications || user.role}
                        {user.specialization && ` • ${user.specialization}`}
                    </Text>
                )}

                <Text className="text-gray-600 mt-2 text-sm leading-5">
                    {user.bio || 'No bio added yet.'}
                </Text>
            </View>
        </View>
    );
}
