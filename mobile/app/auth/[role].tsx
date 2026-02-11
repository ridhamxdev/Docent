import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
    const { role } = useLocalSearchParams<{ role: string }>();
    const router = useRouter();
    const { login, register, handleSocialLoginSuccess } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState(""); // For signup
    const [localLoading, setLocalLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Terms
    const [agreed, setAgreed] = useState(false);

    // Role Specific States
    const [documentFile, setDocumentFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
    const [college, setCollege] = useState("");
    const [year, setYear] = useState("");
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");
    const [state, setState] = useState("");
    const [district, setDistrict] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [qualification, setQualification] = useState("");
    const [experience, setExperience] = useState("");
    const [practiceType, setPracticeType] = useState("");
    const [bio, setBio] = useState("");

    // Google Auth Request
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        redirectUri: makeRedirectUri({
            scheme: 'docent'
        }),
    });

    useEffect(() => {
        if (request) {
            console.log("Redirect URI:", request.redirectUri);
        }
    }, [request]);

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);

            setLocalLoading(true);

            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    handleSocialLoginSuccess(userCredential.user, role as UserRole);
                })
                .catch((error) => {
                    Alert.alert("Login Failed", error.message);
                })
                .finally(() => {
                    setLocalLoading(false);
                });
        }
    }, [response]);

    // Apple Auth Handler
    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const { identityToken, authorizationCode } = credential;

            if (!identityToken) {
                throw new Error('Apple Sign-In failed - no identity token');
            }

            const provider = new OAuthProvider('apple.com');
            const firebaseCredential = provider.credential({
                idToken: identityToken,
                accessToken: authorizationCode || undefined,
            });

            setLocalLoading(true);
            const userCredential = await signInWithCredential(auth, firebaseCredential);

            await handleSocialLoginSuccess(userCredential.user, role as UserRole);

        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                // User canceled
            } else {
                Alert.alert("Apple Login Error", e.message);
            }
        } finally {
            setLocalLoading(false);
        }
    };

    // File Upload Handler
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const file = result.assets[0];
                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please select a document smaller than 5 MB.");
                    return;
                }
                setDocumentFile(result);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const uploadFile = async (file: any): Promise<string> => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/octet-stream',
        } as any);
        formData.append('folder', 'verification');

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to upload document');
        }

        const data = await response.json();
        return data.url;
    };

    // Map role to display name and color
    const roleConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
        dentist: { label: "Dentist", color: "text-blue-600", bg: "bg-blue-600", border: "border-blue-200" },
        student: { label: "Student", color: "text-teal-600", bg: "bg-teal-600", border: "border-teal-200" },
        patient: { label: "Patient", color: "text-purple-600", bg: "bg-purple-600", border: "border-purple-200" },
        admin: { label: "Admin", color: "text-gray-600", bg: "bg-gray-600", border: "border-gray-200" },
    };

    const currentRole = (role as UserRole) || 'patient';
    const config = roleConfig[currentRole] || roleConfig.patient;

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!isLogin) {
            if (password !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return;
            }
            if (!name) {
                Alert.alert("Error", "Please enter your name");
                return;
            }
            if (!agreed) {
                Alert.alert("Error", "Please agree to the Terms & Privacy Policy");
                return;
            }

            // Role specific validations
            if (currentRole === 'dentist' && !documentFile) {
                Alert.alert("Error", "Please upload a verification document");
                return;
            }
            if (currentRole === 'student' && (!college || !year)) {
                Alert.alert("Error", "Please fill in college and year details");
                return;
            }
            if (currentRole === 'patient' && (!age || !sex || !state || !district)) {
                Alert.alert("Error", "Please fill in all patient details");
                return;
            }
        }

        setLocalLoading(true);
        try {
            if (isLogin) {
                await login(email, password, currentRole);
            } else {
                let documentUrl = "";
                if (currentRole === 'dentist' && documentFile && !documentFile.canceled) {
                    setUploading(true);
                    try {
                        documentUrl = await uploadFile(documentFile.assets[0]);
                    } catch (e) {
                        Alert.alert("Upload Failed", "Could not upload verification document.");
                        throw e;
                    } finally {
                        setUploading(false);
                    }
                }

                await register(email, password, currentRole, {
                    displayName: name,
                    ...(currentRole === 'dentist' && { documentUrl, specialization, qualification, experience, practice: practiceType, bio }),
                    ...(currentRole === 'student' && { college, year, state, district }),
                    ...(currentRole === 'patient' && { age, sex, state, district, bio })
                });
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Authentication failed");
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
                <StatusBar style="dark" />

                <View className="items-center mb-8">
                    {/* Back Button */}
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace('/');
                            }
                        }}
                        className="absolute left-0 top-1"
                    >
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>

                    <Text className="text-4xl font-extrabold text-gray-900 mb-2 mt-8">Docent</Text>
                    <Text className={`text-xl font-medium ${config.color}`}>
                        {isLogin ? "Login" : "Sign Up"} as {config.label}
                    </Text>
                </View>

                <View className="gap-4 w-full max-w-sm mx-auto">
                    {!isLogin && (
                        <View>
                            <Text className="mb-1 text-gray-600 font-medium">Full Name</Text>
                            <TextInput
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                placeholder="John Doe"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    )}

                    <View>
                        <Text className="mb-1 text-gray-600 font-medium">Email Address</Text>
                        <TextInput
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View>
                        <Text className="mb-1 text-gray-600 font-medium">Password</Text>
                        <TextInput
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {!isLogin && (
                        <View>
                            <View>
                                <Text className="mb-1 text-gray-600 font-medium">Confirm Password</Text>
                                <TextInput
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>

                            {/* Role Specific Fields */}
                            {currentRole === 'dentist' && (
                                <View className="mt-2">
                                    <View className="mt-4 gap-4">
                                        <TextInput
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                            placeholder="Qualification (e.g., BDS, MDS)"
                                            value={qualification}
                                            onChangeText={setQualification}
                                        />
                                        <TextInput
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                            placeholder="Specialization (e.g., Orthodontist)"
                                            value={specialization}
                                            onChangeText={setSpecialization}
                                        />
                                        <View className="flex-row gap-4">
                                            <TextInput
                                                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Experience (Years)"
                                                value={experience}
                                                onChangeText={setExperience}
                                                keyboardType="numeric"
                                            />
                                            <TextInput
                                                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Practice Type"
                                                value={practiceType}
                                                onChangeText={setPracticeType}
                                            />
                                        </View>
                                        <TextInput
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 h-24"
                                            placeholder="Bio / About Me"
                                            value={bio}
                                            onChangeText={setBio}
                                            multiline
                                            textAlignVertical="top"
                                        />
                                    </View>
                                    <View className="mt-4">
                                        <Text className="mb-1 text-gray-600 font-medium">Verification Document</Text>
                                        <TouchableOpacity
                                            onPress={pickDocument}
                                            className="w-full p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl items-center justify-center"
                                        >
                                            <Text className="text-gray-500">
                                                {(documentFile && !documentFile.canceled) ? documentFile.assets[0].name : "Upload License/ID (Max 5MB)"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {currentRole === 'student' && (
                                <View className="mt-4 gap-4">
                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <TextInput
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                                placeholder="College Name"
                                                value={college}
                                                onChangeText={setCollege}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <TextInput
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Year"
                                                value={year}
                                                onChangeText={setYear}
                                            />
                                        </View>
                                    </View>
                                    <View className="flex-row gap-4">
                                        <TextInput
                                            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                            placeholder="State"
                                            value={state}
                                            onChangeText={setState}
                                        />
                                        <TextInput
                                            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                            placeholder="District"
                                            value={district}
                                            onChangeText={setDistrict}
                                        />
                                    </View>
                                </View>
                            )}

                            {currentRole === 'patient' && (
                                <View className="mt-2 text-red-500">
                                    <View className="flex-row gap-4 mb-4">
                                        <View className="flex-1">
                                            <TextInput
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                                placeholder="Age"
                                                value={age}
                                                onChangeText={setAge}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View className="flex-1 bg-gray-50 border border-gray-200 rounded-xl justify-center">
                                            <Picker
                                                selectedValue={sex}
                                                onValueChange={(itemValue) => setSex(itemValue)}
                                                style={{ height: 50, width: '100%' }}
                                            >
                                                <Picker.Item label="Sex" value="" color="#9CA3AF" />
                                                <Picker.Item label="Male" value="male" />
                                                <Picker.Item label="Female" value="female" />
                                                <Picker.Item label="Other" value="other" />
                                            </Picker>
                                        </View>
                                    </View>
                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <TextInput
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                                placeholder="State"
                                                value={state}
                                                onChangeText={setState}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <TextInput
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                                placeholder="District"
                                                value={district}
                                                onChangeText={setDistrict}
                                            />
                                        </View>
                                    </View>
                                    <TextInput
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 mt-4 h-24"
                                        placeholder="Medical History / Bio (Optional)"
                                        value={bio}
                                        onChangeText={setBio}
                                        multiline
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}

                            {/* Terms Checkbox */}
                            <TouchableOpacity
                                onPress={() => setAgreed(!agreed)}
                                className="flex-row items-center mt-4 gap-2"
                            >
                                <View className={`w-5 h-5 rounded border ${agreed ? 'bg-black border-black' : 'border-gray-300'} items-center justify-center`}>
                                    {agreed && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text className="text-gray-600 text-xs">I agree to the Terms & Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={localLoading || uploading}
                        className={`w-full py-4 rounded-xl mt-4 items-center justify-center ${config.bg} shadow-lg shadow-blue-500/30`}
                    >
                        {localLoading || uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                {isLogin ? "Login" : "Create Account"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsLogin(!isLogin)}
                        className="mt-4 items-center"
                    >
                        <Text className="text-gray-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <Text className={`${config.color} font-bold`}>
                                {isLogin ? "Sign Up" : "Login"}
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Social Login Divider */}
                    <View className="flex-row items-center mt-6">
                        <View className="flex-1 h-[1px] bg-gray-200" />
                        <Text className="mx-4 text-gray-400 font-medium">OR</Text>
                        <View className="flex-1 h-[1px] bg-gray-200" />
                    </View>

                    {/* Social Buttons */}
                    <View className="gap-3 mt-4">
                        <TouchableOpacity
                            onPress={() => {
                                if (request) promptAsync();
                                else Alert.alert("Configuration Missing", "Google Client IDs need to be configured in code.");
                            }}
                            disabled={!request}
                            className={`w-full py-4 rounded-xl border border-gray-200 bg-white items-center justify-center flex-row gap-3 ${!request ? 'opacity-50' : ''}`}
                        >
                            <Ionicons name="logo-google" size={20} color="#DB4437" />
                            <Text className="text-gray-700 font-bold text-base">Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleAppleLogin}
                            className="w-full py-4 rounded-xl border border-gray-200 bg-black items-center justify-center flex-row gap-3"
                        >
                            <Ionicons name="logo-apple" size={20} color="white" />
                            <Text className="text-white font-bold text-base">Continue with Apple</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView >
    );
}
