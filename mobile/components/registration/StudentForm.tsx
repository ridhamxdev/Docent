import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker'; // You might need to install this or use a custom dropdown

// For now, let's use a simple View instead of Picker if not installed, or suggest installing it.
// Assuming we can use a simple modal or just text input for simplicity if Picker isn't available, 
// OR simpler: just text input for Year of Study for MVP or a simple custom selector.
// Let's use standard TextInput for consistency unless requested otherwise.

export default function StudentForm() {
    const { updateProfile } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        username: '',
        collegeName: '',
        yearOfStudy: '',
        locality: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.username || !form.collegeName || !form.yearOfStudy || !form.locality || !form.address) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            await updateProfile({
                displayName: form.name,
                username: form.username,
                collegeName: form.collegeName,
                yearOfStudy: form.yearOfStudy,
                locality: form.locality,
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
                    placeholder="Jane Doe"
                    value={form.name}
                    onChangeText={t => setForm({ ...form, name: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Username *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="janedoe"
                    value={form.username}
                    onChangeText={t => setForm({ ...form, username: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">College Name *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="Dental College & Hospital"
                    value={form.collegeName}
                    onChangeText={t => setForm({ ...form, collegeName: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Year of Study *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="e.g. 3rd Year, Intern"
                    value={form.yearOfStudy}
                    onChangeText={t => setForm({ ...form, yearOfStudy: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Locality *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="City / Area"
                    value={form.locality}
                    onChangeText={t => setForm({ ...form, locality: t })}
                />
            </View>

            <View>
                <Text className="mb-1 text-gray-600 font-medium text-xs">Full Address *</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-gray-900"
                    placeholder="Residential Address"
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
                className="bg-teal-600 py-4 rounded-xl items-center shadow-lg shadow-teal-500/30 mt-4"
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Register as Student</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
