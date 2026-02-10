import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function PatientForm() {
    const { updateProfile } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        age: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.age || !form.address) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            await updateProfile({
                displayName: form.name,
                age: form.age,
                address: form.address,
                isOnboarded: true
            });

            router.replace('/(tabs)/feed');

        } catch (err: any) {
            console.error(err);
            Alert.alert('Error', 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="gap-4">
            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Full Name *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="FullName"
                    value={form.name}
                    onChangeText={t => setForm({ ...form, name: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Age *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="e.g. 25"
                    keyboardType="numeric"
                    value={form.age}
                    onChangeText={t => setForm({ ...form, age: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Address *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="Full Address"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={form.address}
                    onChangeText={t => setForm({ ...form, address: t })}
                />
            </View>

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="bg-purple-600 py-4 rounded-xl items-center shadow-lg shadow-purple-500/30 mt-4"
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Start Using Docent</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
