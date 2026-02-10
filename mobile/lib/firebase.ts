import { initializeApp, getApps, getApp } from "firebase/app";
import {
    initializeAuth,
    // @ts-ignore
    getReactNativePersistence,
    getAuth,
    browserLocalPersistence,
    setPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyBsddaeEoLU5bCzaDZuWiCBn6zpL-mQ3DU",
    authDomain: "docent-platform.firebaseapp.com",
    projectId: "docent-platform",
    storageBucket: "docent-platform.firebasestorage.app",
    messagingSenderId: "1069461065604",
    appId: "1:1069461065604:web:0dbdee01fae2ac0bd057d1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence based on platform
let auth: any;

if (Platform.OS === 'web') {
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence);
} else {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
