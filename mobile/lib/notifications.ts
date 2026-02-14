import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
            throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
    } catch (e) {
        console.log('Error getting push token:', e);
    }

    return token;
}

export function setupNotificationListeners(onNotificationReceived?: (notification: any) => void, onNotificationTapped?: (response: any) => void) {
    // Handle notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received!', notification);
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    // Handle notification tap
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped!', response);
        if (onNotificationTapped) {
            onNotificationTapped(response);
        }
    });

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
}
