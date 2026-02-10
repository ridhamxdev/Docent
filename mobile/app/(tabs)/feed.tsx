import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PostCard from "../../components/PostCard";
import PostModal from "../../components/PostModal";

export default function FeedScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            const roleQuery = user?.role ? `?role=${user.role}` : '';
            const data = await apiClient.get(`/posts${roleQuery}`);
            if (Array.isArray(data)) {
                setPosts(data);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.role]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 pt-12">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="px-4 pb-4 border-b border-gray-200 bg-white mb-2 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-blue-900">Docent</Text>
                <View className="flex-row gap-4">
                    <TouchableOpacity>
                        <Ionicons name="search" size={24} color="#1E3A8A" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color="#1E3A8A" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/messages')}>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color="#1E3A8A" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={posts}
                renderItem={({ item }) => <PostCard post={item} />}
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center p-8 mt-10">
                        <Ionicons name="newspaper-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-4 text-center">No posts yet.{'\n'}Be the first to share something!</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-blue-600/40"
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            <PostModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onPostSuccess={onRefresh}
            />
        </View>
    );
}
