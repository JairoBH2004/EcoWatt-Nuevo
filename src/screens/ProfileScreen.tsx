import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ActivityIndicator, Button, TouchableOpacity,
    ImageBackground, StatusBar, Alert,
    SafeAreaView,
    FlatList,
    Switch
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { 
    getUserProfile, 
    UserProfile, 
    getDevices, 
    Device, 
    setDeviceState, // ✅ Control (POST /control/set)
    getDeviceStatus, // ✅ Estado real (GET /control/status)
    deleteDevice 
} from '../services/authService';

import { useAuthStore } from '../store/useAuthStore';
import styles from '../styles/ProfileStyles';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';

const PRIMARY_GREEN = '#00FF7F';
const PRIMARY_BLUE = '#003366';
const ECOWATT_BACKGROUND = require('../assets/fondo.jpg');

type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

// --- Componentes UI ---

// Fila de información del usuario (Tarifa, Día de corte, etc)
const InfoRow = ({ icon, label, value }: { icon: string; label: string; value?: string }) => (
    <View style={styles.infoRow}>
        <Icon name={icon} size={20} color={PRIMARY_BLUE} style={styles.icon} />
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
);

// Fila de cada Dispositivo
const DeviceRow = ({ 
    item, 
    onToggle, 
    onDelete, 
    isToggling 
}: { 
    item: Device; 
    onToggle: (device: Device) => void;
    onDelete: (device: Device) => void;
    isToggling: boolean;
}) => (
    <View style={styles.deviceRow}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            {/* Ícono que cambia de color según estado */}
            <Icon 
                name="microchip" 
                size={24} 
                color={item.dev_status ? PRIMARY_GREEN : '#888'} 
                style={styles.icon} 
            />
            <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.dev_name}</Text>
                <Text style={styles.deviceMac}>{item.dev_hardware_id}</Text>
                
                {/* Texto de estado (ENCENDIDO/APAGADO) */}
                <Text style={{
                    fontSize: 10, 
                    color: item.dev_status ? PRIMARY_GREEN : '#888', 
                    marginTop: 2, 
                    fontWeight: 'bold'
                }}>
                    {item.dev_status ? 'ENCENDIDO' : 'APAGADO'}
                </Text>
            </View>
        </View>

        {/* Botón Eliminar */}
        <TouchableOpacity 
            onPress={() => onDelete(item)} 
            style={{ padding: 10, marginRight: 5 }}
            disabled={isToggling}
        >
            <Icon name="trash-alt" size={20} color="#FF6347" />
        </TouchableOpacity>

        {/* Switch de Encendido/Apagado */}
        <Switch
            trackColor={{ false: "#767577", true: PRIMARY_GREEN }}
            thumbColor={item.dev_status ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => onToggle(item)}
            value={item.dev_status ?? false} // Asegura que no sea null
            disabled={isToggling} // Deshabilitar mientras carga
        />
    </View>
);

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estado para saber qué dispositivo se está "switcheando" actualmente
    const [togglingDeviceId, setTogglingDeviceId] = useState<number | null>(null);
    const [error, setError] = useState('');
    
    const { token, logout } = useAuthStore();

    // ✅ Carga de datos y Sincronización Real
    const loadData = useCallback(async () => {
        if (!token) {
            Alert.alert("Sesión Expirada", "Por favor, inicia sesión de nuevo.");
            logout();
            return;
        }
        
        // Solo mostrar loading full screen si no tenemos perfil cargado
        if (!profile) setIsLoading(true);
        setError('');
        
        try {
            const [profileData, devicesDataResult] = await Promise.allSettled([
                getUserProfile(token),
                getDevices(token)
            ]);

            if (profileData.status === 'fulfilled') {
                setProfile(profileData.value);
            }

            if (devicesDataResult.status === 'fulfilled') {
                const devicesData = devicesDataResult.value;
                
                // 🔥 SINCRONIZAR ESTADO REAL: Preguntar al Shelly si está ON u OFF
                // Esto es vital porque la base de datos puede estar desactualizada si se fue la luz
                const devicesWithRealStatus = await Promise.all(
                    devicesData.map(async (device) => {
                        try {
                            const status = await getDeviceStatus(token, device.dev_id);
                            // Asumimos que status.status.output es el booleano real
                            const realState = status.status?.output ?? device.dev_status;
                            return { ...device, dev_status: realState };
                        } catch (e) {
                            console.log(`⚠️ No se pudo verificar ${device.dev_name}, usando caché BD.`);
                            return device;
                        }
                    })
                );
                
                setDevices(devicesWithRealStatus);
            } else {
                if (devicesDataResult.reason?.message?.includes('404')) {
                    setDevices([]);
                }
            }
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('401')) logout();
        } finally {
            setIsLoading(false);
        }
    }, [token, logout, profile]);

    useEffect(() => {
        loadData();
        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [loadData, navigation]);

    // ✅ MANEJO DEL SWITCH (ON/OFF) - CORREGIDO
    const handleToggleDevice = async (device: Device) => {
        if (!token) return;

        const targetState = !device.dev_status; 
        const deviceId = device.dev_id;

        // Bloquear este dispositivo para no enviar múltiples clicks
        setTogglingDeviceId(deviceId);

        // 1. Optimistic Update (Cambiar UI inmediatamente)
        setDevices(prevDevices => 
            prevDevices.map(d => 
                d.dev_id === deviceId ? { ...d, dev_status: targetState } : d
            )
        );

        try {
            console.log(`🔌 Enviando comando a ID ${deviceId}: ${targetState ? 'ON' : 'OFF'}`);
            
            // 2. Llamada a API (Control)
            await setDeviceState(token, deviceId, targetState);
            
            console.log('✅ Respuesta Control: OK');

            // ❌ COMENTADO PARA EVITAR REBOTES: 
            // Ya no sobreescribimos el estado con la respuesta inmediata del servidor
            // porque a veces el servidor tarda en enterarse y manda el estado viejo.
            /* if (response && typeof response.new_state === 'boolean') {
                setDevices(prevDevices => 
                    prevDevices.map(d => 
                        d.dev_id === deviceId ? { ...d, dev_status: response.new_state } : d
                    )
                );
            } 
            */

        } catch (error: any) {
            console.error('⚠️ Error al cambiar estado:', error);
            Alert.alert(
                'Error de Conexión', 
                'No se pudo comunicar con el dispositivo. Verifica que esté enchufado.'
            );
            
            // 4. Rollback: Si falló, recargamos los datos reales para volver al estado correcto
            setDevices(prevDevices => 
                prevDevices.map(d => 
                    d.dev_id === deviceId ? { ...d, dev_status: !targetState } : d
                )
            );
            await loadData();
        } finally {
            // Desbloquear el switch
            setTogglingDeviceId(null);
        }
    };

    const handleDeleteDevice = (device: Device) => {
        Alert.alert(
            "Eliminar Dispositivo",
            `¿Estás seguro de eliminar "${device.dev_name}"? Dejarás de monitorear su consumo.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        if (!token) return;
                        try {
                            await deleteDevice(token, device.dev_id);
                            // Actualizar lista localmente sin recargar todo
                            setDevices(prev => prev.filter(d => d.dev_id !== device.dev_id));
                            Alert.alert("Éxito", "Dispositivo eliminado correctamente.");
                        } catch (err: any) {
                            Alert.alert("Error", "No se pudo eliminar el dispositivo.");
                        }
                    }
                }
            ]
        );
    };

    const handleEditProfile = () => {
        if (!profile) return;
        navigation.navigate('EditProfile', { currentUser: profile });
    };

    // --- Renderizados Condicionales ---

    if (isLoading && !profile) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={PRIMARY_GREEN} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    if (error && !profile) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Reintentar" onPress={loadData} color={PRIMARY_BLUE} />
            </View>
        );
    }

    const renderListHeader = () => (
        <>
            <View style={styles.header}>
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <Icon name="pencil-alt" size={20} color={PRIMARY_BLUE} />
                </TouchableOpacity>
                <Icon name="user-circle" size={80} color={PRIMARY_BLUE} />
                <Text style={styles.userName}>{profile?.user_name}</Text>
                <Text style={styles.userEmail}>{profile?.user_email}</Text>
            </View>
            <View style={styles.infoSection}>
                <InfoRow icon="bolt" label="Tarifa CFE" value={profile?.user_trf_rate.toUpperCase()} />
                <InfoRow icon="calendar-day" label="Día de Corte" value={profile?.user_billing_day.toString()} />
            </View>
             <View style={styles.devicesSectionHeader}>
                  <Text style={styles.sectionTitle}>
                      Mis Dispositivos {devices.length > 0 ? `(${devices.length})` : ''}
                  </Text>
             </View>
        </>
    );

    const renderListFooter = () => (
        <>
            <View style={styles.addDeviceContainer}>
                <TouchableOpacity
                    style={styles.addDeviceButton}
                    onPress={() => navigation.navigate('AddDevice')}
                >
                    <Icon name="plus" size={18} color={PRIMARY_BLUE} style={{ marginRight: 10 }} />
                    <Text style={styles.addDeviceButtonText}>Añadir Nuevo Dispositivo</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Icon name="sign-out-alt" size={20} color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </>
    );

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <ImageBackground source={ECOWATT_BACKGROUND} style={styles.container} resizeMode="cover">
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
                <FlatList
                    data={devices}
                    renderItem={({ item }) => (
                        <DeviceRow 
                            item={item} 
                            onToggle={handleToggleDevice}
                            onDelete={handleDeleteDevice} 
                            isToggling={togglingDeviceId === item.dev_id}
                        />
                    )}
                    keyExtractor={(item) => item.dev_id.toString()}
                    ListHeaderComponent={renderListHeader}
                    ListFooterComponent={renderListFooter}
                    ListEmptyComponent={
                        <View style={styles.emptyDeviceListContainer}>
                            <Text style={styles.emptyListText}>No tienes dispositivos registrados.</Text>
                            <Text style={{color: '#888', marginTop: 5}}>Añade uno para empezar a monitorear.</Text>
                        </View>
                    }
                    contentContainerStyle={styles.flatListContentContainer}
                    style={styles.flatListContainer}
                    onRefresh={loadData}
                    refreshing={isLoading}
                />
            </ImageBackground>
        </SafeAreaView>
    );
};

export default ProfileScreen;