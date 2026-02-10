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
        <View className="flex-row justify-around py-4 border-y border-gray-100 bg-white mt-4">
            <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">{postsCount}</Text>
                <Text className="text-xs text-gray-500 font-medium uppercase">Posts</Text>
            </View>
            <TouchableOpacity onPress={onPressFollowers} className="items-center">
                <Text className="text-lg font-bold text-gray-900">{followersCount}</Text>
                <Text className="text-xs text-gray-500 font-medium uppercase">Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressFollowing} className="items-center">
                <Text className="text-lg font-bold text-gray-900">{followingCount}</Text>
                <Text className="text-xs text-gray-500 font-medium uppercase">Following</Text>
            </TouchableOpacity>
        </View>
    );
}
