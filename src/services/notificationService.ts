import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const API_URL = 'https://core-cloud.dev/api/v1';

/**
 * 1. Solicitar permisos (Android 13+ e iOS)
 */
export async function requestNotificationPermission() {
    // [Lógica interna sin cambios, está correcta]
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
    // [Lógica interna sin cambios, está correcta]
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
    // [Lógica interna sin cambios, está correcta]
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
 * 4. Escuchar notificaciones (sin cambios, está bien)
 */
export function setupNotificationListeners() {
    // [Lógica interna sin cambios, está correcta]
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('🔔 [FCM] Notificación recibida (foreground):', remoteMessage);

        Alert.alert(
            remoteMessage.notification?.title || 'Nueva Alerta EcoWatt',
            remoteMessage.notification?.body || 'Revisa tu consumo.'
        );
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('🔔 [FCM] App abierta desde background:', remoteMessage);
    });

    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('🔔 [FCM] App iniciada por notificación:', remoteMessage);
            }
        });

    return unsubscribe;
}

/**
 * 5. ✅ FINAL - Función de inicialización completa (Nombre unificado)
 */
export async function initializeNotificationService(accessToken: string) {
    try {
        // 1. Pedir permisos
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.warn('⚠️ Usuario denegó permisos de notificación');
            return false;
        }

        // 2. Registrar token
        const registered = await registerFCMToken(accessToken);
        if (!registered) {
            console.warn('⚠️ No se pudo registrar el token FCM');
            return false;
        }

        // 3. Setup listeners
        setupNotificationListeners();

        console.log('✅ [FCM] Sistema de notificaciones inicializado completamente');
        return true;
    } catch (error) {
        console.error('❌ [FCM] Error en inicialización:', error);
        return false;
    }
}