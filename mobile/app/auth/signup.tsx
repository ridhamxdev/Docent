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
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function SignupScreen() {
  const { register } = useAuth();
  const router = useRouter(); // Add this

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, 'patient', { displayName: name });
      router.replace('/onboarding');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
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
              <Text className="text-[32px] font-extrabold text-slate-900 leading-tight text-center">
                Create an{"\n"}Account
              </Text>
            </Animated.View>

            {/* Form */}
            <View className="gap-6">
              {/* Name */}
              <Animated.View entering={FadeInDown.delay(300).duration(800)}>
                <View className="bg-white rounded-3xl px-6 py-5 flex-row items-center border border-slate-200 shadow-sm">
                  <Feather name="user" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-4 text-slate-900 text-base font-medium"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </Animated.View>

              {/* Email */}
              <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                <View className="bg-white rounded-3xl px-6 py-5 flex-row items-center border border-slate-200 shadow-sm">
                  <Feather name="mail" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Email"
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
              <Animated.View entering={FadeInDown.delay(500).duration(800)}>
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

              {/* Confirm Password */}
              <Animated.View entering={FadeInDown.delay(600).duration(800)}>
                <View className="bg-white rounded-3xl px-6 py-5 flex-row items-center border border-slate-200 shadow-sm">
                  <Feather name="lock" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-4 text-slate-900 text-base font-medium"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <Feather
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* CTA */}
              <Animated.View entering={FadeInUp.delay(800).duration(800)}>
                <TouchableOpacity
                  onPress={handleSignup}
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
                      Create Account
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Footer */}
            <Animated.View
              entering={FadeInUp.delay(1000).duration(800)}
              className="items-center mt-16"
            >
              <View className="flex-row">
                <Text className="text-slate-500 text-base">
                  Already have an account?{" "}
                </Text>
                <Link href="/auth/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-rose-500 font-bold text-base underline">
                      Login
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
