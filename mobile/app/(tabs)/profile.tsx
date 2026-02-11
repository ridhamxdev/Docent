import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";
// import { apiClient } from '../../lib/apiClient'; // Unused for now
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import UserPostsGrid from '../../components/profile/UserPostsGrid';
import EditProfileModal from '../../components/profile/EditProfileModal';
import AddVisitModal from '../../components/appointments/AddVisitModal';
import DoctorSlotsList from '../../components/appointments/DoctorSlotsList';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'visits'>('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddVisit, setShowAddVisit] = useState(false);
    const [refreshSlotTrigger, setRefreshSlotTrigger] = useState(0);

    // Fetch fresh stats
    const fetchStats = async () => {
        try {
            // Mocking for now as backend endpoint /users/:id might differ
            if (user?.uid) {
                // const data = await apiClient.get<any>(`/users/${user.uid}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const handleMenu = () => {
        Alert.alert(
            "Menu",
            "Options",
            [
                { text: "Edit Profile", onPress: () => setShowEditModal(true) },
                { text: "Settings (Dark Mode)", onPress: () => console.log("Settings") },
                { text: "Log Out", onPress: logout, style: "destructive" },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    if (!user) return <View className="flex-1 bg-white" />;

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar style="light" />
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                <ProfileHeader
                    user={user}
                    isOwner={true}
                    onEdit={() => setShowEditModal(true)}
                    onMenu={handleMenu}
                />

                <ProfileStats
                    postsCount={stats.posts}
                    followersCount={stats.followers}
                    followingCount={stats.following}
                />

                {/* Tabs */}
                <View className="mx-6 mb-4 flex-row bg-gray-200 p-1 rounded-2xl">
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
                    {(user?.role === 'dentist' || user?.isVerified) && (
                        <TouchableOpacity
                            onPress={() => setActiveTab('visits')}
                            className={`flex-1 items-center py-2 rounded-xl ${activeTab === 'visits' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                        >
                            <Text className={`font-bold ${activeTab === 'visits' ? 'text-black' : 'text-gray-500'}`}>Visits</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {activeTab === 'posts' ? (
                    <UserPostsGrid
                        userId={user?.uid}
                        setPostCount={(count) => setStats(s => ({ ...s, posts: count }))}
                    />
                ) : activeTab === 'visits' ? (
                    <View className="p-4 bg-gray-50 min-h-[400px]">
                        <TouchableOpacity
                            onPress={() => setShowAddVisit(true)}
                            className="bg-blue-600 p-3 rounded-xl flex-row justify-center items-center mb-4 shadow-sm"
                        >
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Create Visit Slot</Text>
                        </TouchableOpacity>

                        <Text className="font-bold text-gray-800 mb-2 px-1">Your Slots</Text>
                        <DoctorSlotsList userId={user.uid} refreshTrigger={refreshSlotTrigger} />
                    </View>
                ) : (
                    <View className="p-4 bg-gray-50 min-h-[200px]">
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                            <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                <Text className="font-bold text-gray-500">Email</Text>
                                <Text className="text-gray-900">{user?.email}</Text>
                            </View>
                            {user?.role !== 'patient' && (
                                <>
                                    <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                        <Text className="font-bold text-gray-500">Qualification</Text>
                                        <Text className="text-gray-900">{user?.qualifications || '-'}</Text>
                                    </View>
                                    <View className="flex-row justify-between border-b border-gray-100 pb-2">
                                        <Text className="font-bold text-gray-500">Practice</Text>
                                        <Text className="text-gray-900">{user?.practiceType || '-'}</Text>
                                    </View>
                                </>
                            )}
                        </View>

                        <TouchableOpacity onPress={logout} className="mt-6 flex-row items-center justify-center p-4 bg-red-50 rounded-xl border border-red-100">
                            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                            <Text className="text-red-600 font-bold ml-2">Log Out</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <EditProfileModal
                visible={showEditModal}
                user={user}
                onClose={() => setShowEditModal(false)}
                onSuccess={(data) => {
                    // @ts-ignore
                    updateProfile(data);
                }}
            />

            <AddVisitModal
                visible={showAddVisit}
                onClose={() => setShowAddVisit(false)}
                onSuccess={() => setRefreshSlotTrigger(prev => prev + 1)}
            />
        </View>
    );
}
