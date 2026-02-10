import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiClient } from '../../lib/apiClient';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddVisitModal({ visible, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [capacity, setCapacity] = useState('10');
    const [fee, setFee] = useState('500');

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) setTime(selectedTime);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const slotData = {
                date: date.toISOString().split('T')[0],
                time: timeString,
                fee: Number(fee),
                capacity: Number(capacity),
                bookedCount: 0,
                status: 'open'
            };

            await apiClient.post('/appointments/slots', slotData);

            Alert.alert("Success", "Visit slot created!");
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Create slot failed", error);
            Alert.alert("Error", "Failed to create slot.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-white">
                <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-gray-500 text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="font-bold text-lg">New Visit Slot</Text>
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        <Text className={`font-bold text-lg ${loading ? 'text-gray-300' : 'text-blue-600'}`}>
                            Create
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View className="absolute z-50 inset-0 bg-black/20 justify-center items-center">
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                )}

                <ScrollView className="p-4">
                    <Text className="font-semibold mb-2">Date</Text>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 flex-row items-center justify-between"
                    >
                        <Text className="text-gray-700">{date.toDateString()}</Text>
                        <Ionicons name="calendar-outline" size={20} color="gray" />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker value={date} mode="date" onChange={handleDateChange} minimumDate={new Date()} />
                    )}

                    <Text className="font-semibold mb-2">Time</Text>
                    <TouchableOpacity
                        onPress={() => setShowTimePicker(true)}
                        className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 flex-row items-center justify-between"
                    >
                        <Text className="text-gray-700">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Ionicons name="time-outline" size={20} color="gray" />
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker value={time} mode="time" onChange={handleTimeChange} />
                    )}

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="font-semibold mb-2">Max Capacity</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 p-3 rounded-lg"
                                keyboardType="numeric"
                                value={capacity}
                                onChangeText={setCapacity}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold mb-2">Fee (₹)</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 p-3 rounded-lg"
                                keyboardType="numeric"
                                value={fee}
                                onChangeText={setFee}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}
