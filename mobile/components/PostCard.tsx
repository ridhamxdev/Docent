import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';

const { width } = Dimensions.get('window');

interface PostCardProps {
    post: any;
    onLike?: () => void;
    onComment?: () => void;
}

export default function PostCard({ post, onLike, onComment }: PostCardProps) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.liked || (post.likedBy && user?.uid && post.likedBy.includes(user.uid)) || false);
    const [likesCount, setLikesCount] = useState<number>(post.likes || 0);

    const mediaItems = post.images && post.images.length > 0
        ? post.images
        : post.image
            ? [post.image]
            : post.video
                ? [post.video]
                : [];

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
        <View className="bg-white mb-4 border-b border-gray-100 pb-4">
            {/* Header */}
            <View className="flex-row items-center p-3">
                <Image
                    source={{ uri: post.authorPhoto || `https://ui-avatars.com/api/?name=${post.author}&background=random` }}
                    className="w-10 h-10 rounded-full bg-gray-200"
                />
                <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                        <Text className="font-bold text-gray-900">{post.author}</Text>
                        {post.authorVerified && (
                            <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                    <Text className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="gray" />
                </TouchableOpacity>
            </View>

            {/* Media Carousel */}
            {mediaItems.length > 0 && (
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="w-full" style={{ height: 400 }}>
                    {mediaItems.map((item: string, index: number) => (
                        <View key={index} style={{ width: width, height: 400 }} className="bg-black justify-center items-center">
                            {item.includes('mp4') || item.includes('video') ? (
                                <Video
                                    source={{ uri: item }}
                                    style={{ width: '100%', height: '100%' }}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    isLooping
                                />
                            ) : (
                                <Image
                                    source={{ uri: item }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Actions */}
            <View className="flex-row items-center justify-between px-3 py-3">
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={handleLike} className="flex-row items-center gap-1">
                        <Ionicons name={liked ? "heart" : "heart-outline"} size={26} color={liked ? "#EF4444" : "black"} />
                        {likesCount > 0 && <Text className="font-bold">{likesCount}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onComment} className="flex-row items-center gap-1">
                        <Ionicons name="chatbubble-outline" size={24} color="black" />
                        {post.comments?.length > 0 && <Text className="font-bold">{post.comments.length}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Ionicons name="paper-plane-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Caption */}
            {post.content && (
                <View className="px-3">
                    <Text className="text-gray-900 leading-5">
                        <Text className="font-bold mr-2">{post.author} </Text>
                        {post.content}
                    </Text>
                </View>
            )}
        </View>
    );
}
