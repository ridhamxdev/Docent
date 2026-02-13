import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { initSocket } from '../../lib/socket';

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: number;
    read?: boolean;
    senderName?: string;
}

interface Conversation {
    id: string; // The other user's ID
    name: string;
    lastMessage: string;
    time: number;
    unreadCount: number;
    avatar?: string;
}

export default function MessagesListScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchConversations = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const msgs = await apiClient.get<Message[]>(`/messages/${user.uid}`);

            const conversationsMap = new Map<string, Conversation>();

            msgs.forEach(msg => {
                const otherId = msg.senderId === user.uid ? msg.receiverId : msg.senderId;
                if (!otherId) return;

                const existing = conversationsMap.get(otherId);

                // Determine name (fallback to ID if Name not available in message, 
                // ideally we fetch users but for now use what we have or "User")
                // Frontend fetches all users to map names. Here we might need to do the same
                // or just rely on senderName if present and we are receiver.

                let name = "User";
                if (msg.senderId !== user.uid && msg.senderName) {
                    name = msg.senderName;
                } else if (existing) {
                    name = existing.name;
                }

                const timestamp = new Date(msg.createdAt).getTime();

                if (!existing) {
                    conversationsMap.set(otherId, {
                        id: otherId,
                        name: name,
                        lastMessage: msg.content,
                        time: timestamp,
                        unreadCount: (!msg.read && msg.receiverId === user.uid) ? 1 : 0
                    });
                } else {
                    if (timestamp > existing.time) {
                        existing.lastMessage = msg.content;
                        existing.time = timestamp;
                        // Update name if we have a better one now
                        if (name !== "User" && existing.name === "User") existing.name = name;
                    }
                    if (!msg.read && msg.receiverId === user.uid) {
                        existing.unreadCount += 1;
                    }
                }
            });

            const sortedConversations = Array.from(conversationsMap.values()).sort((a, b) => b.time - a.time);
            setConversations(sortedConversations);

        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.uid]);

    // ... inside MessagesListScreen ...

    useEffect(() => {
        fetchConversations();
        // Remove polling if socket is reliable, or keep as backup (e.g. 30s instead of 5s)
        // const interval = setInterval(fetchConversations, 5000); 
        // return () => clearInterval(interval);

        if (user?.uid) {
            const socket = initSocket(user.uid);

            socket.on('newMessage', (msg: Message) => {
                console.log("List received new message", msg);
                setConversations(prev => {
                    const otherId = msg.senderId === user.uid ? msg.receiverId : msg.senderId;
                    const existingIndex = prev.findIndex(c => c.id === otherId);

                    const newTime = new Date(msg.createdAt).getTime();

                    if (existingIndex !== -1) {
                        // Update existing conversation
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            lastMessage: msg.content,
                            time: newTime,
                            unreadCount: (!msg.read && msg.receiverId === user.uid)
                                ? updated[existingIndex].unreadCount + 1
                                : updated[existingIndex].unreadCount
                        };
                        return updated.sort((a, b) => b.time - a.time);
                    } else {
                        // New conversation (fetch fresh or optimistically add if we have details)
                        // Trigger fetch to get correct name/avatar if needed
                        fetchConversations();
                        return prev;
                    }
                });
            });

            return () => {
                socket.off('newMessage');
            };
        }
    }, [user?.uid, fetchConversations]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            className="flex-row items-center p-4 bg-white border-b border-gray-100"
            onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.id, name: item.name } })}
        >
            <TouchableOpacity onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id } })}>
                <Image
                    source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=random&color=fff` }}
                    className="w-12 h-12 rounded-full bg-gray-200"
                />
            </TouchableOpacity>
            <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-baseline mb-1">
                    <Text className="font-bold text-gray-900 text-base">{item.name}</Text>
                    <Text className="text-xs text-gray-500">
                        {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
            {item.unreadCount > 0 && (
                <View className="bg-blue-600 rounded-full w-5 h-5 items-center justify-center ml-2">
                    <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Search Header */}
            <View className="p-4 border-b border-gray-100 pb-2">
                <View className="bg-gray-100 rounded-lg flex-row items-center px-4 py-2">
                    <Ionicons name="search" size={20} color="gray" />
                    <TextInput
                        placeholder="Search messages..."
                        className="flex-1 ml-2 text-base"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-10">
                            <Text className="text-gray-400">No messages yet</Text>
                        </View>
                    }
                />
            )}

            {/* FAB for New Chat (Optional - could route to Search screen to pick user) */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-blue-600/40"
                onPress={() => router.push('/(tabs)/search')} // Reuse search tab to find user? Or specific modal
            >
                <Ionicons name="chatbubbles-outline" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}
