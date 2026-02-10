import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import MaterialCard from '../../components/study/MaterialCard';
import StudyUploadModal from '../../components/study/StudyUploadModal';
import QuizUploadModal from '../../components/study/QuizUploadModal';

type Category = 'books' | 'pyq' | 'notes' | 'ppt' | 'daily_quiz';

const categories: { id: Category; label: string; icon: string }[] = [
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'pyq', label: 'PYQ', icon: '⚡' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'ppt', label: 'PPT', icon: '📊' },
    { id: 'daily_quiz', label: 'Quiz', icon: '🧠' },
];

export default function StudyScreen() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Category>('books');
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [quizModalVisible, setQuizModalVisible] = useState(false);

    const canUpload = user?.role === 'doctor' || user?.isVerified;

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const url = activeTab === 'daily_quiz'
                ? `/study/quiz`
                : `/study?category=${activeTab}`;

            const data = await apiClient.get(url);
            if (Array.isArray(data)) {
                setMaterials(data);
            } else {
                setMaterials([]);
            }
        } catch (error) {
            console.error("Error fetching study materials:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const filteredMaterials = materials.filter(m => {
        if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const renderHeader = () => (
        <View className="bg-white pb-2">
            <View className="px-4 pb-4 border-b border-gray-200 mb-4 pt-12">
                <Text className="text-2xl font-bold text-blue-900">Study Zone</Text>
            </View>

            {/* Search */}
            <View className="px-4 mb-4">
                <View className="bg-gray-100 rounded-lg flex-row items-center px-4 py-2 border border-gray-200">
                    <Ionicons name="search" size={20} color="gray" />
                    <TextInput
                        placeholder="Search material..."
                        className="flex-1 ml-2 text-base"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mb-2">
                {categories.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => setActiveTab(item.id)}
                        className={`mr-3 px-4 py-2 rounded-full flex-row items-center gap-2 border ${activeTab === item.id
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-200'
                            }`}
                    >
                        <Text>{item.icon}</Text>
                        <Text className={`font-semibold ${activeTab === item.id ? 'text-white' : 'text-gray-700'}`}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
                <View className="w-4" />
            </ScrollView>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar style="dark" />

            {loading ? (
                <View className="flex-1 items-center justify-center pt-20">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={filteredMaterials}
                    renderItem={({ item }) => (
                        activeTab === 'daily_quiz' ? (
                            <View className="bg-white p-4 mx-4 mb-3 rounded-xl shadow-sm border border-gray-100">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="bg-purple-100 px-2 py-1 rounded">
                                        <Text className="text-purple-700 text-xs font-bold">Daily Quiz</Text>
                                    </View>
                                    <Text className="text-xs text-gray-400">{item.date}</Text>
                                </View>
                                <Text className="font-bold text-gray-800 text-lg mb-2">{item.question}</Text>
                                <View className="bg-gray-50 p-2 rounded-lg mb-2 border border-gray-100">
                                    <Text className="text-sm text-gray-600">
                                        <Text className="font-bold">Answer: </Text>
                                        {item.options[item.correctAnswer]}
                                    </Text>
                                </View>
                                <Text className="text-xs text-gray-400">By {item.author}</Text>
                            </View>
                        ) : (
                            <View className="px-4">
                                <MaterialCard material={item} />
                            </View>
                        )
                    )}
                    keyExtractor={(item) => item.id || item._id?.toString() || Math.random().toString()}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <View className="items-center justify-center p-8 mt-10">
                            <Text className="text-4xl mb-4">📂</Text>
                            <Text className="text-gray-500 text-center text-lg font-medium">No study materials found.</Text>
                            <Text className="text-gray-400 text-center mt-2">Try changing the category or search query.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                    stickyHeaderIndices={[0]}
                />
            )}
            {canUpload && (
                <TouchableOpacity
                    className="absolute bottom-6 right-6 bg-teal-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-teal-600/40"
                    onPress={() => activeTab === 'daily_quiz' ? setQuizModalVisible(true) : setUploadModalVisible(true)}
                >
                    <Ionicons name="add" size={32} color="white" />
                </TouchableOpacity>
            )}

            <StudyUploadModal
                visible={uploadModalVisible}
                onClose={() => setUploadModalVisible(false)}
                onSuccess={fetchMaterials}
            />

            <QuizUploadModal
                visible={quizModalVisible}
                onClose={() => setQuizModalVisible(false)}
                onSuccess={fetchMaterials}
            />
        </View>
    );
}
