import { View, Text, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAP = 1;
const ITEM_SIZE = (SCREEN_WIDTH - (GAP * 2)) / 3;

interface Post {
    id: string;
    image?: string;
    images?: string[];
    video?: string;
    content: string;
    authorId?: string; // Add this
    author?: string;   // Add this (name or id depending on backend)
    role?: string;
}

interface Props {
    userId?: string; // If undefined, fetch for current user
    role?: string;
    setPostCount?: (count: number) => void;
    refreshTrigger?: number; // Optional trigger to force refresh
}

export default function UserPostsGrid({ userId, role, setPostCount, refreshTrigger }: Props) {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                console.log('🔄 Fetching user posts - userId:', userId, 'role:', role);
                // Use the new /posts/user/:userId endpoint
                if (userId) {
                    const query = role ? `?role=${role}` : '';
                    const data = await apiClient.get<Post[]>(`/posts/user/${userId}${query}`);

                    if (Array.isArray(data)) {
                        console.log('✅ Loaded', data.length, 'posts for user');
                        setPosts(data);
                        if (setPostCount) setPostCount(data.length);
                    }
                } else {
                    // Fallback to all posts if no userId
                    const query = role ? `?role=${role}` : '';
                    const data = await apiClient.get<Post[]>(`/posts${query}`);
                    if (Array.isArray(data)) {
                        setPosts(data);
                        if (setPostCount) setPostCount(data.length);
                    }
                }
            } catch (error) {
                console.error("❌ Failed to load user posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [userId, role, refreshTrigger]); // Added refreshTrigger

    const renderItem = ({ item }: { item: Post }) => {
        const imageUrl = item.images?.[0] || item.image;

        return (
            <TouchableOpacity
                style={{ width: ITEM_SIZE, height: ITEM_SIZE, marginBottom: GAP }}
                onPress={() => {
                    if (item.id) {
                        router.push(`/post/${item.id}`);
                    }
                }}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full bg-gray-100 items-center justify-center p-2">
                        <Text className="text-xs text-gray-500 text-center" numberOfLines={3}>
                            {item.content}
                        </Text>
                    </View>
                )}
                {item.images && item.images.length > 1 && (
                    <View className="absolute top-1 right-1">
                        <Ionicons name="copy" size={12} color="white" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) return (
        <View className="h-40 items-center justify-center">
            <Text className="text-gray-400">Loading posts...</Text>
        </View>
    );

    if (posts.length === 0) return (
        <View className="h-40 items-center justify-center">
            <Text className="text-gray-400">No posts yet</Text>
        </View>
    );

    return (
        <View className="mt-2 flex-row flex-wrap" style={{ gap: GAP }}>
            {posts.map((post) => (
                <View key={post.id}>
                    {renderItem({ item: post })}
                </View>
            ))}
            {/* Empty placeholders to fill grid if needed, or just let it wrap left */}
        </View>
    );
}
