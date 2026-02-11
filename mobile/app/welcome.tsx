import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Background Decoration */}
            <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                <LinearGradient
                    colors={['#eff6ff', '#ffffff', '#f0fdfa']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                />
                <View className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
                <View className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-40" />
            </View>

            <SafeAreaView className="flex-1 px-8 justify-between py-12">

                {/* Header Content */}
                <View className="mt-12">
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(1000).springify()}
                        className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-8 shadow-sm shadow-slate-200"
                    >
                        <Image
                            source={require('../assets/icon.png')}
                            style={{ width: 44, height: 44, borderRadius: 10 }}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                        <Text className="text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Future of{"\n"}
                            <Text className="text-blue-600">Dental</Text> Care
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                        <Text className="text-lg text-slate-500 mt-6 leading-relaxed font-medium">
                            Connect with top dentists, manage tasks, and advance your career in one unified platform.
                        </Text>
                    </Animated.View>
                </View>

                {/* Action Section */}
                <Animated.View entering={FadeInUp.delay(800).duration(1000).springify()}>
                    <Link href="/auth/login" asChild>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="bg-slate-900 h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-slate-300"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <Text className="text-white text-lg font-bold mr-3 tracking-wide">Get Started</Text>
                            <Feather name="arrow-right" size={20} color="white" />
                        </TouchableOpacity>
                    </Link>

                    <View className="flex-row justify-center mt-8 gap-1.5">
                        <Text className="text-slate-500 font-medium">Already have an account?</Text>
                        <Link href="/auth/login" asChild>
                            <TouchableOpacity>
                                <Text className="text-blue-600 font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}
