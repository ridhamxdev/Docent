import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserPostsGrid from '../../components/profile/UserPostsGrid';

interface UserProfile {
    id: string;
    uid: string;
    displayName: string;
    photoURL: string | null;
    coverPhoto: string | null;
    role: string;
    bio: string | null;
    about: string | null;
    specialization: string | null;
    qualification: string | null;
    experience: string | null;
    clinicName: string | null;
    clinicAddress: string | null;
    consultationFee: number | null;
    collegeName: string | null;
    yearOfStudy: string | null;
    isVerified: boolean;
    followers: number;
    following: number;
}

export default function ViewProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
    const [postsCount, setPostsCount] = useState(0);

    useEffect(() => {
        if (!id) return;
        const fetchProfile = async () => {
            try {
                const data = await apiClient.get<UserProfile>(`/users/profile/${id}`);
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const openChat = () => {
        if (!profile) return;
        router.push({
            pathname: '/messages/[id]',
            params: { id: profile.id, name: profile.displayName }
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Stack.Screen options={{ headerShown: false }} />
                <Ionicons name="person-outline" size={48} color="#CBD5E1" />
                <Text className="text-gray-400 mt-4">User not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-gray-100 px-6 py-2 rounded-xl">
                    <Text className="text-gray-700 font-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isOwnProfile = user?.uid === profile.uid;

    function getRoleBadge() {
        if (profile!.role === 'dentist' && profile!.isVerified) return { label: 'Verified Dentist', color: '#3B82F6', icon: 'medical' as const };
        if (profile!.role === 'dentist') return { label: 'Dentist', color: '#F59E0B', icon: 'medical' as const };
        if (profile!.role === 'student' && profile!.isVerified) return { label: 'Student', color: '#14B8A6', icon: 'school' as const };
        if (profile!.role === 'student') return { label: 'Student', color: '#F59E0B', icon: 'school' as const };
        return null;
    }

    const roleBadge = getRoleBadge();

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="bg-white overflow-hidden pb-6 border-b border-gray-100">
                    <View className="h-36 w-full bg-slate-900">
                        {profile.coverPhoto && (
                            <Image source={{ uri: profile.coverPhoto }} className="w-full h-full opacity-80" resizeMode="cover" />
                        )}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)']}
                            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                        />
                    </View>

                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-4 z-20 w-10 h-10 rounded-full bg-black/40 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>

                    {/* Profile Info */}
                    <View className="items-center -mt-14">
                        <View className="p-1 rounded-full bg-white shadow-sm mb-3">
                            <View className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden">
                                {profile.photoURL ? (
                                    <Image source={{ uri: profile.photoURL }} className="w-full h-full" />
                                ) : (
                                    <View className="w-full h-full items-center justify-center bg-gray-200">
                                        <Ionicons name="person" size={48} color="gray" />
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Name */}
                        <View className="flex-row items-center mb-1">
                            <Text className="text-2xl font-bold text-gray-900">{profile.displayName}</Text>
                            {profile.isVerified && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" style={{ marginLeft: 6 }} />}
                        </View>

                        {/* Role Badge */}
                        {roleBadge && (
                            <View style={{ backgroundColor: roleBadge.color + '18', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 6 }}>
                                <Text style={{ color: roleBadge.color, fontSize: 12, fontWeight: '600' }}>{roleBadge.label}</Text>
                            </View>
                        )}

                        {/* Bio / Tagline */}
                        {profile.bio && (
                            <Text className="text-gray-500 text-sm text-center px-8 mb-4">{profile.bio}</Text>
                        )}

                        {/* Stats Row */}
                        <View className="flex-row items-center gap-6 mb-4">
                            <View className="items-center">
                                <Text className="text-lg font-bold text-gray-900">{postsCount}</Text>
                                <Text className="text-xs text-gray-500">Posts</Text>
                            </View>
                            <View className="w-px h-8 bg-gray-200" />
                            <View className="items-center">
                                <Text className="text-lg font-bold text-gray-900">{profile.followers}</Text>
                                <Text className="text-xs text-gray-500">Followers</Text>
                            </View>
                            <View className="w-px h-8 bg-gray-200" />
                            <View className="items-center">
                                <Text className="text-lg font-bold text-gray-900">{profile.following}</Text>
                                <Text className="text-xs text-gray-500">Following</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        {!isOwnProfile && (
                            <View className="flex-row gap-3 px-6">
                                <TouchableOpacity
                                    onPress={openChat}
                                    className="flex-1 bg-blue-600 flex-row items-center justify-center py-3 rounded-xl"
                                >
                                    <Ionicons name="chatbubble-outline" size={18} color="white" />
                                    <Text className="text-white font-bold ml-2">Message</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View className="mx-6 mt-4 mb-4 flex-row bg-gray-200 p-1 rounded-2xl">
                    <TouchableOpacity
                        onPress={() => setActiveTab('posts')}
                        className={`flex-1 items-center py-2 rounded-xl ${activeTab === 'posts' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'posts' ? 'text-black' : 'text-gray-500'}`}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('about')}
                        className={`flex-1 items-center py-2 rounded-xl ${activeTab === 'about' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold ${activeTab === 'about' ? 'text-black' : 'text-gray-500'}`}>About</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'posts' ? (
                    <UserPostsGrid
                        userId={profile.uid}
                        setPostCount={(count) => setPostsCount(count)}
                    />
                ) : (
                    <View className="p-4 bg-gray-50 min-h-[200px]">
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                            {/* Professional Details for Dentists */}
                            {profile.role === 'dentist' && (
                                <>
                                    {profile.specialization && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">Specialization</Text>
                                            <Text className="text-gray-900">{profile.specialization}</Text>
                                        </View>
                                    )}
                                    {profile.qualification && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">Qualification</Text>
                                            <Text className="text-gray-900">{profile.qualification}</Text>
                                        </View>
                                    )}
                                    {profile.experience && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">Experience</Text>
                                            <Text className="text-gray-900">{profile.experience} years</Text>
                                        </View>
                                    )}
                                    {profile.clinicName && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">Clinic</Text>
                                            <Text className="text-gray-900">{profile.clinicName}</Text>
                                        </View>
                                    )}
                                    {profile.clinicAddress && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">Address</Text>
                                            <Text className="text-gray-900 flex-1 text-right ml-4">{profile.clinicAddress}</Text>
                                        </View>
                                    )}
                                    {profile.consultationFee && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">Consultation Fee</Text>
                                            <Text className="text-gray-900 font-bold">₹{profile.consultationFee}</Text>
                                        </View>
                                    )}
                                </>
                            )}

                            {/* Student Details */}
                            {profile.role === 'student' && (
                                <>
                                    {profile.collegeName && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">College</Text>
                                            <Text className="text-gray-900">{profile.collegeName}</Text>
                                        </View>
                                    )}
                                    {profile.yearOfStudy && (
                                        <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                            <Text className="font-bold text-gray-500">Year</Text>
                                            <Text className="text-gray-900">{profile.yearOfStudy}</Text>
                                        </View>
                                    )}
                                </>
                            )}

                            {/* About section */}
                            {profile.about && (
                                <View className="pt-2">
                                    <Text className="font-bold text-gray-500 mb-2">About</Text>
                                    <Text className="text-gray-700 leading-5">{profile.about}</Text>
                                </View>
                            )}

                            {/* Fallback if no details */}
                            {!profile.specialization && !profile.qualification && !profile.collegeName && !profile.about && (
                                <View className="items-center py-6">
                                    <Ionicons name="information-circle-outline" size={32} color="#CBD5E1" />
                                    <Text className="text-gray-400 mt-2">No details available</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
