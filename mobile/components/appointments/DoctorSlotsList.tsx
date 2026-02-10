import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface Slot {
    id: string;
    date: string;
    time: string;
    fee: number;
    capacity: number;
    bookedCount: number;
    status: 'open' | 'closed';
}

interface Props {
    userId: string;
    refreshTrigger?: number; // Prop to force refresh
}

export default function DoctorSlotsList({ userId, refreshTrigger }: Props) {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                // Assuming endpoint exists or we filter by doctor in appointments query
                const data = await apiClient.get<Slot[]>(`/appointments/slots?doctorId=${userId}`);
                if (Array.isArray(data)) {
                    setSlots(data);
                }
            } catch (error) {
                console.error("Failed to load slots", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSlots();
    }, [userId, refreshTrigger]);

    if (loading) return <ActivityIndicator size="small" color="#2563EB" />;

    if (slots.length === 0) {
        return (
            <View className="p-8 items-center border-2 border-dashed border-gray-200 rounded-xl">
                <Text className="text-gray-400">No slots created yet.</Text>
            </View>
        );
    }

    return (
        <View>
            {slots.map((slot) => (
                <View key={slot.id} className="bg-white p-4 rounded-xl border border-gray-100 mb-3 flex-row justify-between items-center shadow-sm">
                    <View>
                        <Text className="font-bold text-gray-900 text-lg">{slot.time}</Text>
                        <Text className="text-gray-500 text-sm">{new Date(slot.date).toDateString()}</Text>
                        <Text className="text-blue-600 font-medium text-xs mt-1">₹{slot.fee}</Text>
                    </View>
                    <View className="items-end">
                        <View className="bg-gray-100 px-3 py-1 rounded-full mb-1">
                            <Text className="text-xs font-bold text-gray-700">
                                {slot.bookedCount} / {slot.capacity} Booked
                            </Text>
                        </View>
                        {slot.status === 'open' ? (
                            <Text className="text-green-600 text-[10px] font-bold uppercase">Open</Text>
                        ) : (
                            <Text className="text-red-500 text-[10px] font-bold uppercase">Closed</Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
}
