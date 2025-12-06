// notificationService.ts

import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useNotificationStore } from '../store/useNotificationStore'; // 🔥 NUEVA IMPORTACIÓN

const API_URL = 'https://core-cloud.dev/api/v1';

/**
 * 1. Solicitar permisos (Android 13+ e iOS)
 */
export async function requestNotificationPermission() {
    try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log('❌ [FCM] Permiso de Android 13+ denegado');
                return false;
            }
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('✅ [FCM] Permisos concedidos');
            return true;
        } else {
            console.log('⚠️ [FCM] Permisos denegados');
            return false;
        }
    } catch (error) {
        console.error('❌ [FCM] Error pidiendo permisos:', error);
        return false;
    }
}

/**
 * 2. Obtener el Token FCM
 */
export async function getFCMToken() {
    try {
        if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
        }

        const token = await messaging().getToken();
        console.log('📱 [FCM] Token obtenido:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('❌ [FCM] Error obteniendo token:', error);
        return null;
    }
}

/**
 * 3. Registrar token en el backend
 */
export async function registerFCMToken(accessToken: string) {
    try {
        const fcmToken = await getFCMToken();
        if (!fcmToken) {
            console.warn('⚠️ [FCM] No se pudo obtener token');
            return false;
        }

        const deviceName = await DeviceInfo.getDeviceName();
        const platform = Platform.OS;

        const response = await fetch(`${API_URL}/fcm/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fcm_token: fcmToken,
                device_name: deviceName,
                platform: platform
            }),
        });

        if (response.ok) {
            console.log('✅ [BACKEND] Token FCM registrado correctamente');
            return true;
        } else {
            const errorText = await response.text();
            console.warn('⚠️ [BACKEND] Error al registrar token:', errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ [BACKEND] Error de red:', error);
        return false;
    }
}

/**
 * 4. Escuchar notificaciones (MODIFICADO para usar el store)
 */
export function setupNotificationListeners() {
    const addNotification = useNotificationStore.getState().addNotification; // 🔥 USAR EL STORE
    
    const handleNotification = (remoteMessage: any) => {
        if (remoteMessage && (remoteMessage.notification?.title || remoteMessage.notification?.body)) {
            // Solo guardamos si hay contenido de notificación
            addNotification({
                title: remoteMessage.notification?.title || 'Notificación EcoWatt',
                body: remoteMessage.notification?.body || 'Revisa tus alertas.',
            });
            console.log('🔔 [FCM] Notificación guardada en el store:', remoteMessage.notification?.title);
        }
    };
    
    // Al recibir un mensaje en foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('🔔 [FCM] Notificación recibida (foreground):', remoteMessage);
        handleNotification(remoteMessage);
    });

    // Manejo de app abierta desde background
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('🔔 [FCM] App abierta desde background:', remoteMessage);
        handleNotification(remoteMessage);
    });

    // Manejo de app iniciada por notificación (quit state)
    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('🔔 [FCM] App iniciada por notificación:', remoteMessage);
                handleNotification(remoteMessage);
            }
        });

    return unsubscribe;
}

/**
 * 5. ✅ FINAL - Función de inicialización completa
 */
export async function initializeNotificationService(accessToken: string) {
    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) return false;

        const registered = await registerFCMToken(accessToken);
        if (!registered) return false;

        setupNotificationListeners();

        console.log('✅ [FCM] Sistema de notificaciones inicializado completamente');
        return true;
    } catch (error) {
        console.error('❌ [FCM] Error en inicialización:', error);
        return false;
    }
}