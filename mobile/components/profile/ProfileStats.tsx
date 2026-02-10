import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    onPressFollowers?: () => void;
    onPressFollowing?: () => void;
}

export default function ProfileStats({ postsCount, followersCount, followingCount, onPressFollowers, onPressFollowing }: Props) {
    return (
        <View className="mx-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row justify-between mb-6">
            <View className="items-center flex-1">
                <Text className="text-xl font-bold text-gray-900">{postsCount}</Text>
                <Text className="text-[10px] text-gray-400 font-semibold tracking-wider mt-1 uppercase">Posts</Text>
            </View>
            <View className="w-[1px] bg-gray-100 h-full py-2" />
            <TouchableOpacity onPress={onPressFollowers} className="items-center flex-1">
                <Text className="text-xl font-bold text-gray-900">{followersCount}</Text>
                <Text className="text-[10px] text-gray-400 font-semibold tracking-wider mt-1 uppercase">Followers</Text>
            </TouchableOpacity>
            <View className="w-[1px] bg-gray-100 h-full py-2" />
            <TouchableOpacity onPress={onPressFollowing} className="items-center flex-1">
                <Text className="text-xl font-bold text-gray-900">{followingCount}</Text>
                <Text className="text-[10px] text-gray-400 font-semibold tracking-wider mt-1 uppercase">Following</Text>
            </TouchableOpacity>
        </View>
    );
}
