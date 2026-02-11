import { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
    const router = useRouter();
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        // Logo Animation
        scale.value = withSequence(
            withTiming(0, { duration: 0 }),
            withSpring(1, { damping: 12 })
        );
        opacity.value = withTiming(1, { duration: 1000 });

        // Text Animation (delayed)
        textOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));

        // Navigation after animation
        const timeout = setTimeout(() => {
            router.replace('/welcome');
        }, 2500);

        return () => clearTimeout(timeout);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    return (
        <View className="flex-1 bg-white items-center justify-center">
            <StatusBar style="dark" />

            {/* Animated Logo */}
            <Animated.View style={logoStyle} className="items-center">
                <Image
                    source={require('../assets/icon.png')}
                    style={{ width: 120, height: 120, borderRadius: 24 }}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Animated Text */}
            <Animated.View style={[textStyle, { marginTop: 24 }]}>
                <Text className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    Docent
                </Text>
                <Text className="text-slate-500 text-center mt-2 font-medium tracking-wide text-sm uppercase">
                    Your Dental Companion
                </Text>
            </Animated.View>
        </View>
    );
}
