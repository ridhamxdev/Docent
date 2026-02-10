import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function QuizUploadModal({ visible, onClose, onSuccess }: Props) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [explanation, setExplanation] = useState('');

    const handleOptionChange = (text: string, index: number) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const handleSubmit = async () => {
        if (!question.trim() || options.some(o => !o.trim())) {
            Alert.alert("Error", "Please fill all fields.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/study/quiz', {
                question,
                options,
                correctAnswer,
                explanation,
                author: user?.displayName || 'Verified User'
            });

            Alert.alert("Success", "Quiz uploaded successfully!");
            setQuestion('');
            setOptions(['', '', '', '']);
            setExplanation('');
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Quiz upload failed", error);
            Alert.alert("Error", "Failed to upload quiz.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-gray-500 text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="font-bold text-lg">New Quiz</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        <Text className={`font-bold text-lg ${loading ? 'text-gray-300' : 'text-blue-600'}`}>
                            Post
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View className="absolute z-50 inset-0 bg-black/20 justify-center items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}

                <ScrollView className="p-4">
                    <Text className="font-semibold mb-2">Question</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-6 text-lg"
                        placeholder="Enter the question..."
                        multiline
                        textAlignVertical="top"
                        value={question}
                        onChangeText={setQuestion}
                    />

                    <Text className="font-semibold mb-3">Options (Select the correct one)</Text>
                    {options.map((opt, index) => (
                        <View key={index} className="flex-row items-center mb-3 gap-3">
                            <TouchableOpacity onPress={() => setCorrectAnswer(index)}>
                                <Ionicons
                                    name={correctAnswer === index ? "radio-button-on" : "radio-button-off"}
                                    size={24}
                                    color={correctAnswer === index ? "#2563EB" : "#9CA3AF"}
                                />
                            </TouchableOpacity>
                            <TextInput
                                className={`flex-1 border p-3 rounded-lg ${correctAnswer === index ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                value={opt}
                                onChangeText={(text) => handleOptionChange(text, index)}
                            />
                        </View>
                    ))}

                    <Text className="font-semibold mb-2 mt-4">Explanation</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-8 h-24"
                        placeholder="Why is this the correct answer?"
                        multiline
                        textAlignVertical="top"
                        value={explanation}
                        onChangeText={setExplanation}
                    />
                </ScrollView>
            </View>
        </Modal>
    );
}
