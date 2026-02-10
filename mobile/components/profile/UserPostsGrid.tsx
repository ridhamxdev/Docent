import { View, Text, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_SIZE = (SCREEN_WIDTH - 4) / 3; // 4px gap roughly

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
}

export default function UserPostsGrid({ userId, role, setPostCount }: Props) {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // If userId is provided, filter by it. If not, filtered by logged in implicitly (or show all depending on backend API design)
                // The frontend uses 'author' query param.
                const query = userId ? `?authorId=${userId}` : '';
                // Note: Frontend API `/posts` filters by `author` NAME not ID usually, need to check backend.
                // Assuming we can filter by author ID or we filter client side if needed.
                // Let's try standard endpoint.

                const data = await apiClient.get<Post[]>(`/posts${query}`);
                if (Array.isArray(data)) {
                    // Filter if needed
                    const myPosts = userId ? data.filter(p => p.authorId === userId || p.author === userId) : data;
                    // NOTE: Backend might return all posts if no filter. 
                    // For 'My Profile', we expect to see MY posts.
                    // Ideally backend supports /users/:id/posts or /posts?author=...

                    setPosts(data);
                    if (setPostCount) setPostCount(data.length);
                }
            } catch (error) {
                console.error("Failed to load user posts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [userId]);

    const renderItem = ({ item }: { item: Post }) => {
        const imageUrl = item.images?.[0] || item.image;

        return (
            <TouchableOpacity
                style={{ width: ITEM_SIZE, height: ITEM_SIZE, marginBottom: 2, marginRight: 2 }}
                onPress={() => {
                    // Option 1: Open Post Modal/Detail
                    // Option 2: Navigate to a Feed filtered by this post
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
        <View className="mt-2 flex-row flex-wrap">
            {posts.map((post) => (
                <View key={post.id}>
                    {renderItem({ item: post })}
                </View>
            ))}
        </View>
    );
}
