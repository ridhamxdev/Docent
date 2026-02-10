import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Linking, Image } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface Product {
    name: string;
    price: number;
    store: string;
    url: string;
    bestDeal?: boolean;
}

export default function ShopScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const data = await apiClient.get(`/shop/comparison?q=${query}`);
            if (Array.isArray(data)) {
                setResults(data);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("Shop search error", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <View className={`p-4 mb-3 rounded-xl border flex-row justify-between items-center ${item.bestDeal
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-100'
            }`}>
            <View className="flex-1 mr-4">
                <Text className="font-bold text-gray-900 text-lg mb-1">{item.name}</Text>
                <View className="flex-row items-center gap-2">
                    <Text className="text-gray-500 text-sm">🏪 {item.store}</Text>
                    {item.bestDeal && (
                        <View className="bg-green-100 px-2 py-0.5 rounded-full">
                            <Text className="text-green-700 text-[10px] font-bold uppercase">Best Deal</Text>
                        </View>
                    )}
                </View>
            </View>
            <View className="items-end">
                <Text className="text-xl font-bold text-teal-700">₹{item.price}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                    <Text className="text-blue-600 font-semibold text-xs mt-1">Visit Store ↗</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 pt-12">
            <StatusBar style="dark" />

            {/* Header */}
            <View className="px-4 pb-4 border-b border-gray-200 bg-white">
                <Text className="text-2xl font-bold text-blue-900 mb-4">Price Comparison</Text>
                <Text className="text-gray-500 text-sm mb-4">Compare prices across 50+ dental stores.</Text>

                <View className="flex-row gap-2">
                    <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3 flex-row items-center border border-gray-200">
                        <Ionicons name="search" size={20} color="gray" />
                        <TextInput
                            className="flex-1 ml-2 text-base"
                            placeholder="e.g., Composite, File"
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleSearch}
                        disabled={loading}
                        className={`px-4 rounded-xl items-center justify-center ${loading ? 'bg-teal-400' : 'bg-teal-600'}`}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Ionicons name="search" size={24} color="white" />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results */}
            <FlatList
                data={results}
                renderItem={renderProduct}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    searched && !loading ? (
                        <View className="items-center justify-center py-10">
                            <Text className="text-gray-400 text-lg">No results found.</Text>
                            <Text className="text-gray-400 text-sm">Try searching for "Composite" or "GIC"</Text>
                        </View>
                    ) : (
                        !searched ? (
                            <View className="items-center justify-center py-20 opacity-50">
                                <Ionicons name="pricetag-outline" size={64} color="gray" />
                                <Text className="text-gray-400 text-lg mt-4">Search to compare prices</Text>
                            </View>
                        ) : null
                    )
                }
            />
        </View>
    );
}
