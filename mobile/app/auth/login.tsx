import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 28,
              paddingTop: 60,
              paddingBottom: 32,
              justifyContent: 'center',
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(800)}
              className="items-center mb-16"
            >
              <Text className="text-[34px] font-extrabold text-slate-900 leading-tight text-center">
                Welcome{"\n"}Back!
              </Text>
            </Animated.View>

            {/* Form */}
            <View className="gap-6">
              {/* Email */}
              <Animated.View entering={FadeInDown.delay(300).duration(800)}>
                <View className="bg-white rounded-3xl px-6 py-5 flex-row items-center border border-slate-200 shadow-sm">
                  <Feather name="mail" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Username or Email"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-4 text-slate-900 text-base font-medium"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </Animated.View>

              {/* Password */}
              <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                <View className="bg-white rounded-3xl px-6 py-5 flex-row items-center border border-slate-200 shadow-sm">
                  <Feather name="lock" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-4 text-slate-900 text-base font-medium"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Forgot */}
              <View className="items-end">
                <TouchableOpacity>
                  <Text className="text-rose-500 font-semibold text-sm tracking-wide">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Button */}
              <Animated.View entering={FadeInUp.delay(600).duration(800)}>
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  className="bg-rose-500 h-[60px] rounded-3xl items-center justify-center mt-8"
                  style={{
                    shadowColor: '#f43f5e',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 8,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-base font-bold tracking-wider">
                      Login
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Social */}
            <Animated.View
              entering={FadeInUp.delay(800).duration(800)}
              className="mt-16 items-center"
            >
              <Text className="text-slate-400 text-sm font-medium mb-6">
                - OR Continue with -
              </Text>

              <View className="flex-row gap-6">
                <TouchableOpacity className="w-14 h-14 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm">
                  <FontAwesome name="google" size={22} color="#DB4437" />
                </TouchableOpacity>

                <TouchableOpacity className="w-14 h-14 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm">
                  <FontAwesome name="apple" size={22} color="black" />
                </TouchableOpacity>

                <TouchableOpacity className="w-14 h-14 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm">
                  <FontAwesome name="facebook" size={22} color="#4267B2" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View
              entering={FadeInUp.delay(1000).duration(800)}
              className="items-center mt-16"
            >
              <View className="flex-row">
                <Text className="text-slate-500 text-base">
                  Create an account{" "}
                </Text>
                <Link href="/auth/signup" asChild>
                  <TouchableOpacity>
                    <Text className="text-rose-500 font-bold text-base underline">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
