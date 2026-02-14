import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiClient } from '../../lib/apiClient';

interface Props {
    visible: boolean;
    dentistId: string;
    dentistName?: string;
    fee?: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AppointmentRequestModal({ visible, dentistId, dentistName, fee = 500, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState('10:00 AM');

    // File states
    const [opdFile, setOpdFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true
            });
            if (result.assets && result.assets.length > 0) {
                setOpdFile(result.assets[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert("Required", "Please provide a reason for the visit.");
            return;
        }

        setLoading(true);
        try {
            // Mocking Payment specific logic for now
            // In real app: Initialize Razorpay here

            // 1. Upload File if selected
            let opdUrl = '';
            if (opdFile) {
                const uploadForm = new FormData();
                // @ts-ignore
                uploadForm.append('file', {
                    uri: opdFile.uri,
                    name: opdFile.name,
                    type: opdFile.mimeType || 'application/octet-stream'
                });
                uploadForm.append('folder', 'appointments');

                const res = await apiClient.post('/upload', uploadForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                opdUrl = res.url;
            }

            // 2. Create Appointment via Backend
            // Using a generic endpoint. Adjust if backend has specific route.
            // Based on frontend messages controller logic `requestAppointment`
            await apiClient.post('/appointments', {
                dentistId,
                dentistName,
                date: date.toISOString().split('T')[0],
                time,
                reason,
                opdUrl,
                fee,
                status: 'pending' // Initial status
            });

            Alert.alert("Success", "Appointment requested successfully!");
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Booking failed", error);
            Alert.alert("Error", "Failed to book appointment.");
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
                    <Text className="font-bold text-lg">Book Appointment</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        <Text className={`font-bold text-lg ${loading ? 'text-gray-300' : 'text-blue-600'}`}>
                            Book
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View className="absolute z-50 inset-0 bg-black/20 justify-center items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}

                <ScrollView className="p-4">
                    <View className="bg-blue-50 p-4 rounded-xl mb-6">
                        <Text className="text-blue-800 font-medium text-center">
                            Consultation Fee: <Text className="font-bold text-xl">₹{fee}</Text>
                        </Text>
                    </View>

                    <Text className="font-semibold mb-2">Reason for Visit</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 h-24"
                        placeholder="Describe your symptoms..."
                        multiline
                        textAlignVertical="top"
                        value={reason}
                        onChangeText={setReason}
                    />

                    <Text className="font-semibold mb-2">Date</Text>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 flex-row items-center justify-between"
                    >
                        <Text className="text-gray-700">{date.toDateString()}</Text>
                        <Ionicons name="calendar-outline" size={20} color="gray" />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    <Text className="font-semibold mb-2">Time</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {['10:00 AM', '11:00 AM', '12:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTime(t)}
                                className={`px-4 py-2 rounded-lg border ${time === t ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={time === t ? 'text-white font-bold' : 'text-gray-700'}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="font-semibold mb-2">OPD Card / Reports (Optional)</Text>
                    <TouchableOpacity
                        onPress={pickDocument}
                        className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded-xl items-center justify-center mb-8"
                    >
                        {opdFile ? (
                            <View className="flex-row items-center">
                                <Ionicons name="document-text" size={24} color="#2563EB" />
                                <Text className="ml-2 text-gray-900 font-medium shrink" numberOfLines={1}>{opdFile.name}</Text>
                            </View>
                        ) : (
                            <View className="items-center">
                                <Ionicons name="cloud-upload-outline" size={24} color="gray" />
                                <Text className="text-gray-500 mt-1">Tap to upload PDF or Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Modal>
    );
}
