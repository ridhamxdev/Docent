import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

interface Dentist {
    id: string;
    uid: string;
    displayName: string;
    photoURL: string | null;
    specialization: string | null;
    qualification: string | null;
    experience: string | null;
    clinicName: string | null;
    clinicAddress: string | null;
    consultationFee: number | null;
    isVerified: boolean;
    bio: string | null;
}

export default function SearchScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDentists = useCallback(async (query = '') => {
        if (!user?.uid) return;
        try {
            const params = new URLSearchParams();
            params.append('exclude', user.uid);
            if (query.trim()) params.append('q', query.trim());

            const data = await apiClient.get<Dentist[]>(`/users/search/dentists?${params.toString()}`);
            setDentists(data);
        } catch (error) {
            console.error("Search dentists error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.uid]);

    // Initial load
    useEffect(() => {
        fetchDentists();
    }, [fetchDentists]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchDentists(searchQuery);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery, fetchDentists]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDentists(searchQuery);
    };

    const openChat = (dentist: Dentist) => {
        router.push({
            pathname: '/messages/[id]',
            params: { id: dentist.id, name: dentist.displayName }
        });
    };

    const renderDentistCard = ({ item }: { item: Dentist }) => (
        <View className="mx-4 mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <View className="p-4">
                {/* Top Row: Avatar + Name + Badge - Tappable */}
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id } })}
                    activeOpacity={0.7}
                    className="flex-row items-center mb-3"
                >
                    <View className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border-2 border-blue-100">
                        {item.photoURL ? (
                            <Image source={{ uri: item.photoURL }} className="w-full h-full" />
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-blue-50">
                                <Ionicons name="person" size={24} color="#3B82F6" />
                            </View>
                        )}
                    </View>
                    <View className="ml-3 flex-1">
                        <View className="flex-row items-center">
                            <Text className="text-base font-bold text-gray-900">{item.displayName}</Text>
                            {item.isVerified && (
                                <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
                            )}
                        </View>
                        {item.specialization && (
                            <Text className="text-sm text-blue-600 font-medium">{item.specialization}</Text>
                        )}
                    </View>
                    {/* Verified Badge */}
                    {item.isVerified ? (
                        <View className="bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            <Text className="text-xs font-semibold text-green-700">Verified</Text>
                        </View>
                    ) : (
                        <View className="bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Text className="text-xs font-semibold text-amber-700">Pending</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Details Grid */}
                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                    {item.qualification && (
                        <View className="flex-row items-center mb-1.5">
                            <Ionicons name="school-outline" size={14} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-2">{item.qualification}</Text>
                        </View>
                    )}
                    {item.experience && (
                        <View className="flex-row items-center mb-1.5">
                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-2">{item.experience} years experience</Text>
                        </View>
                    )}
                    {(item.clinicName || item.clinicAddress) && (
                        <View className="flex-row items-start">
                            <Ionicons name="location-outline" size={14} color="#6B7280" style={{ marginTop: 2 }} />
                            <View className="ml-2 flex-1">
                                {item.clinicName && (
                                    <Text className="text-sm font-medium text-gray-700">{item.clinicName}</Text>
                                )}
                                {item.clinicAddress && (
                                    <Text className="text-xs text-gray-500">{item.clinicAddress}</Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Consultation Fee + Chat Button */}
                <View className="flex-row items-center justify-between">
                    {item.consultationFee ? (
                        <View className="flex-row items-center">
                            <Text className="text-xs text-gray-500">Consultation: </Text>
                            <Text className="text-sm font-bold text-gray-900">₹{item.consultationFee}</Text>
                        </View>
                    ) : (
                        <View />
                    )}
                    <TouchableOpacity
                        onPress={() => openChat(item)}
                        className="bg-blue-600 flex-row items-center px-5 py-2.5 rounded-xl"
                    >
                        <Ionicons name="chatbubble-outline" size={16} color="white" />
                        <Text className="text-white font-bold text-sm ml-2">Chat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View >
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Search Header */}
            <View className="bg-white px-4 pt-2 pb-4 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900 mb-3">Find a Dentist</Text>
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search by name, specialization, clinic..."
                        className="flex-1 ml-3 text-gray-900 text-base"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results Count */}
            {!loading && (
                <View className="px-4 py-2">
                    <Text className="text-sm text-gray-500">
                        {dentists.length} dentist{dentists.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            )}

            {/* Dentist List */}
            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="text-gray-400 mt-2">Loading dentists...</Text>
                </View>
            ) : (
                <FlatList
                    data={dentists}
                    renderItem={renderDentistCard}
                    keyExtractor={(item) => item.id}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-12">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="search-outline" size={36} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-500 text-center text-base font-medium">No dentists found</Text>
                            <Text className="text-gray-400 text-center text-sm mt-1">
                                {searchQuery ? 'Try a different search term' : 'No dentists are registered yet'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
