import { View, Text, Image, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
// @ts-ignore
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
// Standard vertical aspect ratio (4:5) is 1.25
// const CARD_HEIGHT = width * 1.25;
const CARD_HEIGHT = width; // Square aspect ratio to reduce length as requested

interface PostCardProps {
    post: any;
    onLike?: () => void;
    onComment?: () => void;
    onPress?: () => void;
}

export default function PostCard({ post, onLike, onComment, onPress }: PostCardProps) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.liked || (post.likedBy && user?.uid && post.likedBy.includes(user.uid)) || false);
    const [likesCount, setLikesCount] = useState<number>(post.likes || 0);

    const mediaItem = (post.images && post.images.length > 0) ? post.images[0] : post.image;
    const isVideo = mediaItem && (mediaItem.includes('mp4') || mediaItem.includes('video'));

    const handleLike = async () => {
        const isLiked = !liked;
        setLiked(isLiked);
        setLikesCount((prev: number) => isLiked ? prev + 1 : prev - 1);
        try {
            await apiClient.post(`/posts/${post.id}/like`, { userId: user?.uid });
            if (onLike) onLike();
        } catch (error) {
            console.error('Failed to like post', error);
            setLiked(!isLiked);
            setLikesCount((prev: number) => !isLiked ? prev + 1 : prev - 1);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className="mb-6 rounded-[32px] overflow-hidden bg-white shadow-sm mx-4"
            style={{ height: CARD_HEIGHT }}
        >
            {/* Background Content */}
            <View className="absolute inset-0 bg-gray-900">
                {mediaItem ? (
                    isVideo ? (
                        <Video
                            source={{ uri: mediaItem }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode={ResizeMode.COVER}
                            isLooping
                            shouldPlay={false} // Autoplay might be too heavy
                        />
                    ) : (
                        <Image
                            source={{ uri: mediaItem }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    )
                ) : (
                    <View className="w-full h-full justify-center items-center bg-gray-100">
                        <Text className="text-gray-400 p-8 text-center text-lg">{post.content?.substring(0, 100)}...</Text>
                    </View>
                )}
            </View>

            {/* Gradient Overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' }}
            />

            {/* Top Header Pill */}
            <View className="absolute top-4 left-4 z-10 flex-row items-center bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                <Image
                    source={{ uri: post.authorPhoto || `https://ui-avatars.com/api/?name=${post.author}&background=random` }}
                    className="w-6 h-6 rounded-full bg-gray-200 border border-white/50"
                />
                <Text className="text-white font-bold text-xs ml-2 mr-1">{post.author}</Text>
                {post.authorVerified && <Ionicons name="checkmark-circle" size={12} color="#60A5FA" />}
            </View>

            {/* Bottom Content Container */}
            <View className="absolute bottom-0 left-0 right-0 p-5 pb-6 z-10">
                {/* Tags */}
                <View className="flex-row gap-2 mb-3 flex-wrap">
                    <View className="bg-white/20 px-3 py-1 rounded-full border border-white/10">
                        <Text className="text-white text-xs font-semibold tracking-wide">
                            {post.category || 'Dentistry'}
                        </Text>
                    </View>
                </View>

                {/* Text Content */}
                <Text className="text-white text-lg font-bold leading-6 shadow-md mb-2 shadow-black/50" numberOfLines={3}>
                    {post.content}
                </Text>

                <Text className="text-gray-300 text-xs mb-2 shadow-black/50">
                    {new Date(post.createdAt).toLocaleDateString()}
                </Text>
            </View>

            {/* Floating Action Button - Like */}
            <TouchableOpacity
                onPress={handleLike}
                className="absolute bottom-6 right-5 w-14 h-14 rounded-full bg-white items-center justify-center shadow-lg"
                style={{ elevation: 5 }}
            >
                <Ionicons name={liked ? "heart" : "heart"} size={28} color={liked ? "#EF4444" : "#E5E7EB"} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}
