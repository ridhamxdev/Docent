import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome6, Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    ZoomIn,
    withSpring,
    withDelay,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 40;
const SQUARES_HORIZONTAL = Math.ceil(width / GRID_SIZE);
const SQUARES_VERTICAL = Math.ceil(height / GRID_SIZE);

const APP_NAME = "EnamDoc";

// --- Components ---

const GridBackground = () => {
    return (
        <View style={StyleSheet.absoluteFill} className="opacity-[0.03]">
            {/* Vertical Lines */}
            {Array.from({ length: SQUARES_HORIZONTAL }).map((_, i) => (
                <View
                    key={`v-${i}`}
                    className="absolute bg-slate-900 w-[1px] h-full"
                    style={{ left: i * GRID_SIZE }}
                />
            ))}
            {/* Horizontal Lines */}
            {Array.from({ length: SQUARES_VERTICAL }).map((_, i) => (
                <View
                    key={`h-${i}`}
                    className="absolute bg-slate-900 w-full h-[1px]"
                    style={{ top: i * GRID_SIZE }}
                />
            ))}
        </View>
    );
};

const RippleCircle = ({ delay, size }: { delay: number, size: number }) => {
    const scale = useSharedValue(0.5);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(delay, withRepeat(
            withTiming(1.5, { duration: 4000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        ));
        opacity.value = withDelay(delay, withRepeat(
            withSequence(
                withTiming(0.4, { duration: 1000 }),
                withTiming(0, { duration: 3000 })
            ),
            -1,
            false
        ));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
        width: size,
        height: size,
        borderRadius: size / 2,
    }));

    return <Animated.View style={[style]} className="absolute border border-slate-300" />;
};

export default function WelcomeScreen() {
    const router = useRouter();

    // Animation Shared Values
    const toothScale = useSharedValue(1);
    const floatY = useSharedValue(0);

    useEffect(() => {
        // Subtle floating for the whole composition
        floatY.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );

        // Pulse Animation for Tooth
        toothScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const floatingStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatY.value }]
    }));

    const toothStyle = useAnimatedStyle(() => ({
        transform: [{ scale: toothScale.value }]
    }));


    return (
        <View className="flex-1 bg-[#FDFDFD]">
            <StatusBar style="dark" />

            <GridBackground />

            {/* Ripples emanating from center */}
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
                <RippleCircle delay={0} size={width * 0.8} />
                <RippleCircle delay={1000} size={width * 0.8} />
                <RippleCircle delay={2000} size={width * 0.8} />
            </View>

            <SafeAreaView className="flex-1 justify-between py-6">

                {/* Header */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(800)}
                    className="items-center px-6 mt-4 z-10"
                >
                    <View className="flex-row items-center space-x-3 mb-2">
                        <View className="w-10 h-10 bg-slate-900 rounded-xl items-center justify-center shadow-sm">
                            <MaterialCommunityIcons name="tooth" size={24} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-slate-900 tracking-tight">
                            {APP_NAME}
                        </Text>
                    </View>
                    <Text className="text-slate-500 font-medium tracking-wide text-xs uppercase">
                        Clinical Execution System
                    </Text>
                </Animated.View>

                {/* Center Content */}
                <View className="flex-1 items-center justify-center relative px-4">

                    {/* Main Interface Card/Phone */}
                    <Animated.View
                        entering={ZoomIn.duration(1000).springify()}
                        style={floatingStyle}
                        className="w-[220px] h-[400px] bg-white rounded-[28px] border-4 border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden"
                    >
                        {/* Signal/Wifi Area */}
                        <View className="w-full h-7 flex-row justify-between px-5 items-center mt-1.5">
                            <Text className="text-[9px] font-bold text-slate-400">9:41</Text>
                            <View className="flex-row space-x-1">
                                <View className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                                <View className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                            </View>
                        </View>

                        {/* App UI Header */}
                        <View className="mx-4 mt-3 flex-row items-center justify-between">
                            <View>
                                <Text className="text-[10px] text-slate-400 font-semibold uppercase">Welcome back</Text>
                                <Text className="text-base font-bold text-slate-800">Dr. Sharma</Text>
                            </View>
                            <View className="w-9 h-9 bg-blue-50 rounded-full items-center justify-center">
                                <FontAwesome6 name="user-doctor" size={14} color="#3b82f6" />
                            </View>
                        </View>

                        {/* Stats Card */}
                        <View className="mx-4 mt-5 bg-slate-900 rounded-xl p-3.5 shadow-md shadow-slate-300">
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="text-slate-400 text-[10px] font-medium">Pending Tasks</Text>
                                    <Text className="text-white text-2xl font-bold mt-0.5">12</Text>
                                </View>
                                <View className="bg-slate-800 p-1.5 rounded-lg">
                                    <Ionicons name="stats-chart" size={14} color="#60a5fa" />
                                </View>
                            </View>
                            <View className="mt-3 flex-row items-center">
                                <Text className="text-green-400 text-[10px] font-bold">+2 New</Text>
                                <Text className="text-slate-500 text-[10px] ml-2">since yesterday</Text>
                            </View>
                        </View>

                        {/* Recent Items List (Abstract) */}
                        <View className="mx-4 mt-5 space-y-2">
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Recent Activity</Text>
                            {[1, 2, 3].map((item) => (
                                <View key={item} className="flex-row items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <View className={`w-7 h-7 rounded-full items-center justify-center mr-2.5 ${item === 1 ? 'bg-blue-100' : item === 2 ? 'bg-orange-100' : 'bg-green-100'}`}>
                                        <MaterialCommunityIcons
                                            name={item === 1 ? "tooth-outline" : item === 2 ? "calendar-clock" : "check-circle-outline"}
                                            size={14}
                                            color={item === 1 ? "#2563eb" : item === 2 ? "#f97316" : "#059669"}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <View className="w-20 h-2 bg-slate-200 rounded-full mb-1" />
                                        <View className="w-14 h-1.5 bg-slate-100 rounded-full" />
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Floating elements attached to interface */}
                        <Animated.View style={toothStyle} className="absolute -right-3 -bottom-3 opacity-10">
                            <MaterialCommunityIcons name="tooth" size={100} color="#cbd5e1" />
                        </Animated.View>

                    </Animated.View>

                </View>

                {/* Footer / CTA */}
                <Animated.View
                    entering={FadeInUp.delay(500).springify()}
                    className="px-6 pb-4 w-full"
                >
                    <View className="items-center mb-5">
                        <Text className="text-lg font-bold text-slate-900 text-center leading-6">
                            Precision Tools for{"\n"}
                            <Text className="text-blue-600">Modern Dentistry</Text>
                        </Text>
                    </View>

                    <Link href="/auth/login" asChild>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="bg-slate-900 w-full rounded-xl py-3.5 flex-row items-center justify-center shadow-lg shadow-slate-300"
                        >
                            <Text className="text-white text-base font-bold tracking-wide mr-2">Start Session</Text>
                            <FontAwesome6 name="arrow-right-long" size={14} color="white" />
                        </TouchableOpacity>
                    </Link>
                </Animated.View>

            </SafeAreaView>
        </View>
    );
}
