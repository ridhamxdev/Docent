import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function StudyUploadModal({ visible, onClose, onSuccess }: Props) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'books',
        year: '1st Year',
        subject: '',
        chapter: '',
        university: '',
    });

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true
            });

            if (result.assets && result.assets.length > 0) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            console.error("Document picking error", err);
        }
    };

    const handleSubmit = async () => {
        if (!file || !formData.title) {
            Alert.alert("Error", "Please select a file and enter a title.");
            return;
        }

        setLoading(true);
        try {
            // 1. Upload File
            const uploadForm = new FormData();
            // @ts-ignore
            uploadForm.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/octet-stream'
            });
            uploadForm.append('folder', 'study');

            const uploadRes = await apiClient.post('/upload', uploadForm, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { url: fileUrl } = uploadRes;

            // 2. Save Metadata
            const studyData = {
                ...formData,
                fileUrl,
                author: user?.displayName || 'Unknown',
                authorType: 'verified'
            };

            await apiClient.post('/study', studyData);

            Alert.alert("Success", "Study material uploaded!");
            setFile(null);
            setFormData({ ...formData, title: '', description: '' });
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Upload failed", error);
            Alert.alert("Error", "Failed to upload material.");
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
                    <Text className="font-bold text-lg">Upload Material</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        <Text className={`font-bold text-lg ${loading ? 'text-gray-300' : 'text-blue-600'}`}>
                            Done
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View className="absolute z-50 inset-0 bg-black/20 justify-center items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}

                <ScrollView className="p-4">
                    <Text className="font-semibold mb-2">Title</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4"
                        placeholder="E.g., Anatomy Notes"
                        value={formData.title}
                        onChangeText={t => setFormData({ ...formData, title: t })}
                    />

                    <Text className="font-semibold mb-2">Category</Text>
                    <View className="border border-gray-200 rounded-lg mb-4 bg-gray-50">
                        <Picker
                            selectedValue={formData.category}
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                        >
                            <Picker.Item label="📚 Books" value="books" />
                            <Picker.Item label="📝 PYQ (Papers)" value="pyq" />
                            <Picker.Item label="🗒️ Notes" value="notes" />
                            <Picker.Item label="📊 PPT" value="ppt" />
                        </Picker>
                    </View>

                    {formData.category !== 'books' && (
                        <>
                            <Text className="font-semibold mb-2">Year</Text>
                            <View className="border border-gray-200 rounded-lg mb-4 bg-gray-50">
                                <Picker
                                    selectedValue={formData.year}
                                    onValueChange={(val) => setFormData({ ...formData, year: val })}
                                >
                                    <Picker.Item label="1st Year" value="1st Year" />
                                    <Picker.Item label="2nd Year" value="2nd Year" />
                                    <Picker.Item label="3rd Year" value="3rd Year" />
                                    <Picker.Item label="Final Year" value="4th Year" />
                                    <Picker.Item label="Intern" value="Intern" />
                                </Picker>
                            </View>
                        </>
                    )}

                    {['notes', 'ppt'].includes(formData.category) && (
                        <>
                            <Text className="font-semibold mb-2">Subject</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4"
                                placeholder="E.g., Pathology"
                                value={formData.subject}
                                onChangeText={t => setFormData({ ...formData, subject: t })}
                            />
                        </>
                    )}

                    {formData.category === 'pyq' && (
                        <>
                            <Text className="font-semibold mb-2">University</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4"
                                placeholder="E.g., MUHS"
                                value={formData.university}
                                onChangeText={t => setFormData({ ...formData, university: t })}
                            />
                        </>
                    )}

                    <Text className="font-semibold mb-2">Description</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 h-24"
                        placeholder="Short description..."
                        multiline
                        textAlignVertical="top"
                        value={formData.description}
                        onChangeText={t => setFormData({ ...formData, description: t })}
                    />

                    <TouchableOpacity
                        onPress={pickDocument}
                        className="bg-blue-50 border-2 border-dashed border-blue-200 p-6 rounded-xl items-center justify-center mb-8"
                    >
                        {file ? (
                            <>
                                <Ionicons name="document" size={32} color="#2563EB" />
                                <Text className="text-blue-600 font-bold mt-2 text-center">{file.name}</Text>
                                <Text className="text-gray-400 text-xs mt-1">{(file.size ? file.size / 1024 : 0).toFixed(1)} KB</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={32} color="#2563EB" />
                                <Text className="text-blue-600 font-bold mt-2">Select File</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Modal>
    );
}
