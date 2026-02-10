import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PostCard from "../../components/PostCard";
import PostModal from "../../components/PostModal";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View className="px-5 py-3 flex-row justify-between items-center z-10 bg-white">
                <View className="flex-row items-center gap-2">
                    {/* <Image source={require('../../assets/icon.png')} className="w-8 h-8 rounded-lg" /> */}
                    <Text className="text-2xl font-black text-gray-900 tracking-tighter">Docent.</Text>
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                        <Ionicons name="search-outline" size={22} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/messages')}
                        className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={posts}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onPress={() => router.push(`/post/${item.id}`)}
                        onComment={() => router.push(`/post/${item.id}`)}
                    />
                )}
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
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                className="bg-gray-50"
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
        </SafeAreaView>
    );
}
