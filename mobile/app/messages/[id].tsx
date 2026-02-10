import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AppointmentRequestModal from '../../components/appointments/AppointmentRequestModal';
import { initSocket } from '../../lib/socket';

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: number;
    senderName?: string;
}

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
    const { user } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [showAppointment, setShowAppointment] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    const fetchMessages = async () => {
        if (!user?.uid || !id) return;
        try {
            const allMsgs = await apiClient.get<Message[]>(`/messages/${user.uid}`);
            // Filter only this conversation
            const chatMsgs = allMsgs.filter(m =>
                (m.senderId === user.uid && m.receiverId === id) ||
                (m.senderId === id && m.receiverId === user.uid)
            ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            setMessages(chatMsgs);
        } catch (error) {
            console.error("Fetch chat error", error);
        }
    };

    // Socket Listener
    useEffect(() => {
        if (user?.uid) {
            console.log("Initializing socket for", user.uid);
            const socket = initSocket(user.uid);

            socket.on('newMessage', (msg: Message) => {
                console.log("Received new message", msg);
                // Check if message belongs to current chat (either from OTHER person to ME, or ME to OTHER (on other device))
                if ((msg.senderId === id && msg.receiverId === user.uid) ||
                    (msg.senderId === user.uid && msg.receiverId === id)) {

                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    });
                }
            });

            return () => {
                socket.off('newMessage');
            };
        }
    }, [user?.uid, id]);

    // Initial fetch (keep existing polling as backup or remove if socket is 100% reliable)
    // For now, removing polling interval in favor of socket, but keeping initial fetch
    useEffect(() => {
        fetchMessages();
    }, [id, user?.uid]);


    // Scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            // setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() || !user || !id) return;

        const content = text.trim();
        setText('');
        setSending(true);

        // Optimistic update
        const optimisticMsg: Message = {
            id: Date.now().toString(),
            senderId: user.uid,
            receiverId: id,
            content: content,
            createdAt: Date.now(),
            senderName: user.displayName || 'Me'
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            await apiClient.post('/messages', {
                senderId: user.uid,
                senderName: user.displayName || 'User',
                receiverId: id,
                content: content,
                type: 'message'
            });
            // Re-fetch to confirm
            fetchMessages();
        } catch (error) {
            console.error("Send failed", error);
            // Ideally remove optimistic message or show error
        } finally {
            setSending(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-gray-50"
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Stack.Screen
                options={{
                    title: name || 'Chat',
                    headerBackTitle: 'Messages',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => setShowAppointment(true)}>
                            <Ionicons name="calendar-outline" size={24} color="#2563EB" />
                        </TouchableOpacity>
                    )
                }}
            />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => {
                    const isMe = item.senderId === user?.uid;
                    return (
                        <View className={`flex-row mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <View className="w-8 h-8 rounded-full bg-gray-300 mr-2 items-center justify-center">
                                    <Text className="text-xs font-bold text-gray-600">{(name || '?')[0]}</Text>
                                </View>
                            )}
                            <View
                                className={`px-4 py-3 rounded-2xl max-w-[75%] ${isMe ? 'bg-blue-600 rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'
                                    }`}
                            >
                                <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-800'}`}>
                                    {item.content}
                                </Text>
                                <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />

            <View className="p-3 bg-white border-t border-gray-200 flex-row items-center gap-2 mb-2">
                <TouchableOpacity className="p-2">
                    <Ionicons name="add" size={24} color="#2563EB" />
                </TouchableOpacity>
                <TextInput
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base border border-gray-200 max-h-24"
                    placeholder="Type a message..."
                    multiline
                    value={text}
                    onChangeText={setText}
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!text.trim() || sending}
                    className={`p-3 rounded-full ${!text.trim() ? 'bg-gray-200' : 'bg-blue-600'}`}
                >
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {id && (
                <AppointmentRequestModal
                    visible={showAppointment}
                    doctorId={id}
                    doctorName={name}
                    onClose={() => setShowAppointment(false)}
                    onSuccess={() => {
                        setShowAppointment(false);
                        // Optional: Send automated message
                    }}
                />
            )}
        </KeyboardAvoidingView>
    );
}
