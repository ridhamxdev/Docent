import { View, Text, Modal, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../lib/apiClient';

interface MeetingRequestModalProps {
    visible: boolean;
    onClose: () => void;
    patientId: string;
    dentistId: string;
    onSuccess: () => void;
}

export default function MeetingRequestModal({ visible, onClose, patientId, dentistId, onSuccess }: MeetingRequestModalProps) {
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSchedule = async () => {
        setLoading(true);
        try {
            const meeting = await apiClient.post('/meetings', {
                patientId,
                dentistId,
                date: date.toISOString().split('T')[0],
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'pending'
            }) as { id: string };

            // Is "system message" needed here? Or does the backend trigger it?
            // For now, let's send a manual message from client to retain chat flow
            await apiClient.post('/messages', {
                senderId: patientId,
                receiverId: dentistId,
                content: `📅 Meeting Requested for ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                type: 'message',
                metadata: {
                    type: 'meeting_request',
                    meetingId: meeting.id
                }
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to schedule meeting", error);
            alert("Failed to schedule meeting");
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const currentDate = selectedDate;
            // Keep time from previous state? No, date picker usually resets time to 00:00 or current.
            // We'll just update date part.
            const newDate = new Date(date);
            newDate.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            setDate(newDate);
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            const currentDate = selectedDate;
            const newDate = new Date(date);
            newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
            setDate(newDate);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Schedule Meeting</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-500 mb-2">Select Date</Text>
                    <TouchableOpacity
                        className="bg-gray-100 p-4 rounded-xl mb-4 flex-row items-center"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#2563EB" />
                        <Text className="ml-3 text-base text-gray-900">{date.toLocaleDateString()}</Text>
                    </TouchableOpacity>

                    <Text className="text-gray-500 mb-2">Select Time</Text>
                    <TouchableOpacity
                        className="bg-gray-100 p-4 rounded-xl mb-6 flex-row items-center"
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Ionicons name="time-outline" size={20} color="#2563EB" />
                        <Text className="ml-3 text-base text-gray-900">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={date}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onTimeChange}
                        />
                    )}

                    <TouchableOpacity
                        className={`bg-blue-600 p-4 rounded-xl items-center ${loading ? 'opacity-70' : ''}`}
                        onPress={handleSchedule}
                        disabled={loading}
                    >
                        <Text className="text-white font-bold text-lg">
                            {loading ? 'Scheduling...' : 'Send Request'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
