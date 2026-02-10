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
        <View className="mb-6 bg-white overflow-hidden pb-6 border-b border-gray-100">
            {/* Professional Header Background */}
            <View className="h-32 w-full absolute top-0 left-0 right-0 bg-slate-900">
                {user.coverPhoto && (
                    <Image
                        source={{ uri: user.coverPhoto }}
                        className="w-full h-full opacity-80"
                        resizeMode="cover"
                    />
                )}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                />
            </View>

            {/* Header Actions */}
            <View className="flex-row justify-between items-center px-6 pt-12 mb-4 relative z-10">
                {isOwner ? (
                    <TouchableOpacity
                        onPress={onEdit}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name="pencil" size={20} color="white" />
                    </TouchableOpacity>
                ) : <View className="w-10" />}

                {isOwner && (
                    <TouchableOpacity
                        onPress={onMenu}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name="settings-outline" size={20} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Centered Profile Info */}
            <View className="items-center mt-2">
                {/* Avatar with Ring */}
                <View className="p-1 rounded-full bg-white shadow-sm mb-3">
                    <View className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden">
                        {user.photoURL ? (
                            <Image source={{ uri: user.photoURL }} className="w-full h-full" />
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-gray-200">
                                <Ionicons name="person" size={48} color="gray" />
                            </View>
                        )}
                    </View>
                </View>

                {/* Name & Badge */}
                <View className="flex-row items-center mb-1">
                    <Text className="text-2xl font-bold text-gray-900 tracking-tight">
                        {user.displayName || 'User'}
                    </Text>
                    {user.isVerified && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" style={{ marginLeft: 6 }} />}
                </View>

                {/* Role / Bio */}
                <Text className="text-gray-500 font-medium text-sm mb-4 text-center px-8 leading-5">
                    {user.bio || (user.role === 'doctor' ? 'Medical Professional' : 'Docent Member')}
                </Text>
            </View>
        </View>
    );
}
