import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Share, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function PostDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Fetch post details
                // Assuming GET /posts/:id returns the post object with comments populated
                const data = await apiClient.get<any>(`/posts/${id}`);
                setPost(data);
                setLiked(data.liked || (data.likedBy && user?.uid && data.likedBy.includes(user.uid)) || false);
                setLikesCount(data.likes || 0);
            } catch (error) {
                console.error("Failed to fetch post details", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPost();
    }, [id]);

    const handleLike = async () => {
        const isLiked = !liked;
        setLiked(isLiked);
        setLikesCount(prev => isLiked ? prev + 1 : prev - 1);

        try {
            await apiClient.post(`/posts/${id}/like`, { userId: user?.uid });
        } catch (error) {
            console.error('Failed to like post', error);
            setLiked(!isLiked);
            setLikesCount(prev => !isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(tabs)/feed');
        }
    };

    const handleShare = async () => {
        try {
            const message = `Check out this post by ${post.author}: ${post.content || ''}`;
            if (Platform.OS === 'web') {
                if (navigator.share) {
                    await navigator.share({
                        title: 'Docent Post',
                        text: message,
                        url: window.location.href,
                    });
                } else {
                    alert('Link copied to clipboard!');
                    // In a real app, use Clipboard API
                }
            } else {
                await Share.share({
                    message,
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            const newComment = {
                userId: user?.uid,
                userName: user?.displayName || 'User',
                userPhoto: user?.photoURL,
                content: commentText,
                createdAt: new Date().toISOString()
            };

            // Optimistic update
            const updatedComments = [...(post.comments || []), newComment];
            setPost({ ...post, comments: updatedComments });
            setCommentText('');

            await apiClient.post(`/posts/${id}/comment`, {
                userId: user?.uid,
                content: newComment.content
            });
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
    );

    if (!post) return (
        <View className="flex-1 bg-white items-center justify-center">
            <Text>Post not found</Text>
        </View>
    );

    const mediaItem = (post.images && post.images.length > 0) ? post.images[0] : post.image;
    const isVideo = mediaItem && (mediaItem.includes('mp4') || mediaItem.includes('video'));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <StatusBar style="dark" />

            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-100 mt-8 bg-white z-10">
                <TouchableOpacity onPress={handleBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="font-bold text-lg">Post</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Author Info */}
                <View className="flex-row items-center p-4">
                    <Image
                        source={{ uri: post.authorPhoto || `https://ui-avatars.com/api/?name=${post.author}&background=random` }}
                        className="w-10 h-10 rounded-full bg-gray-200"
                    />
                    <View className="ml-3">
                        <Text className="font-bold text-base">{post.author}</Text>
                        <Text className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Media */}
                {mediaItem && (
                    <View className="w-full bg-black aspect-square">
                        {isVideo ? (
                            <Video
                                source={{ uri: mediaItem }}
                                style={{ width: '100%', height: '100%' }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping
                            />
                        ) : (
                            <Image
                                source={{ uri: mediaItem }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        )}
                    </View>
                )}

                {/* Content */}
                {post.content && (
                    <View className="p-4">
                        <Text className="text-base text-gray-900 leading-6">{post.content}</Text>
                    </View>
                )}

                {/* Interactions */}
                <View className="flex-row items-center justify-between px-4 py-2 border-y border-gray-100 mx-4">
                    <View className="flex-row gap-6">
                        <TouchableOpacity onPress={handleLike} className="flex-row items-center gap-2">
                            <Ionicons name={liked ? "heart" : "heart-outline"} size={26} color={liked ? "#EF4444" : "black"} />
                            <Text className="font-medium">{likesCount} Likes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center gap-2">
                            <Ionicons name="chatbubble-outline" size={24} color="black" />
                            <Text className="font-medium">{post.comments?.length || 0} Comments</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Comments List */}
                <View className="p-4 pb-20">
                    <Text className="font-bold text-lg mb-4">Comments</Text>
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment: any, index: number) => (
                            <View key={index} className="flex-row mb-4">
                                <Image
                                    source={{ uri: comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=random` }}
                                    className="w-8 h-8 rounded-full bg-gray-200 mt-1"
                                />
                                <View className="ml-3 flex-1 bg-gray-50 p-3 rounded-2xl">
                                    <Text className="font-bold text-sm mb-1">{comment.userName}</Text>
                                    <Text className="text-gray-800">{comment.content}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-400 text-center py-4">No comments yet. Be the first!</Text>
                    )}
                </View>
            </ScrollView>

            {/* Comment Input */}
            <View className="p-4 border-t border-gray-100 bg-white flex-row items-center pb-8">
                <Image
                    source={{ uri: user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=random` }}
                    className="w-8 h-8 rounded-full bg-gray-200 mr-3"
                />
                <TextInput
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-3"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                />
                <TouchableOpacity onPress={handleComment} disabled={submitting || !commentText.trim()}>
                    <Text className={`font-bold ${commentText.trim() ? 'text-blue-600' : 'text-gray-300'}`}>Post</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
