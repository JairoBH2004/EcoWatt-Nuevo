import { PermissionsAndroid, Platform, Alert } from 'react-native';

/**
 * Solicita permiso de almacenamiento (para guardar PDFs)
 * Solo necesario en Android < 13
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  // En Android 13+ (API 33+) no se necesita este permiso
  if (Platform.OS === 'android' && Platform.Version < 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permiso de Almacenamiento',
          message: 'EcoWatt necesita acceso al almacenamiento para guardar reportes',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Permiso de almacenamiento concedido');
        return true;
      } else {
        console.log('❌ Permiso de almacenamiento denegado');
        Alert.alert(
          'Permiso Denegado',
          'No podemos guardar el reporte sin permiso de almacenamiento.'
        );
        return false;
      }
    } catch (err) {
      console.warn('Error al solicitar permiso:', err);
      return false;
    }
  }
  
  // iOS o Android 13+ no necesitan este permiso
  return true;
};

/**
 * Solicita permisos de WiFi y ubicación (para escanear dispositivos)
 */
export const requestWiFiPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // iOS no necesita estos permisos
  }

  try {
    const apiLevel = Platform.Version as number;
    let permissions: any[] = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];

    // Android 13+ necesita el permiso especial de WiFi
    if (apiLevel >= 33) {
      permissions.push('android.permission.NEARBY_WIFI_DEVICES' as any);
    }

    const granted = await PermissionsAndroid.requestMultiple(permissions);
    
    const allGranted = Object.values(granted).every(
      permission => permission === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) {
      Alert.alert('Error', 'Se requieren permisos de WiFi');
      return false;
    }
    
    console.log('✅ Permisos de WiFi concedidos');
    return true;
  } catch (err) {
    console.warn('Error al solicitar permisos WiFi:', err);
    Alert.alert('Error', 'Se requieren permisos de WiFi');
    return false;
  }
};