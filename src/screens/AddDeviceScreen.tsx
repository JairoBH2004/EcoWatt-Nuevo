import React, { useState, useEffect } from 'react';
import {
    View, Text, ActivityIndicator, TouchableOpacity, SafeAreaView,
    Platform, FlatList, Modal, TextInput, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import WifiManager from 'react-native-wifi-reborn';

import styles from '../styles/AddDeviceStyles';
import { useAuthStore } from '../store/useAuthStore';
import { 
    registerDevice, 
    getDevices, 
    setDeviceState, 
    getDeviceStatus 
} from '../services/authService';
import { requestWiFiPermissions } from '../utils/permissions';

// ✅ CREDENCIALES MQTT
const MQTT_CONFIG = {
    server: '134.209.61.74:1883',
    user: 'ecowatt_shelly',
    pass: 'SjTqQh4htnRK7rqN8tsOmSgFY', 
};

// 🔥 URL DEL BACKEND PARA INGESTIÓN DE DATOS
const INGESTION_URL = 'https://core-cloud.dev/api/v1/ingest/shelly';

type AddDeviceScreenProps = {
    navigation: { goBack: () => void };
};

type ShellyNetwork = {
    SSID: string;
    BSSID: string;
    level: number;
};

type Step =
    | 'requestingPermissions'
    | 'scanningWifi'
    | 'deviceList'
    | 'connecting'
    | 'configuring'
    | 'success'
    | 'error'
    | 'idle';

// --- ProgressBar Component ---
const ProgressBar = ({ currentStep }: { currentStep: Step }) => {
    let progress = 0;
    let stepLabel = '';

    switch (currentStep) {
        case 'requestingPermissions':
        case 'scanningWifi': progress = 20; stepLabel = '1. Buscando'; break;
        case 'deviceList': progress = 40; stepLabel = '2. Selección'; break;
        case 'connecting': progress = 60; stepLabel = '3. Conectando'; break;
        case 'configuring': progress = 80; stepLabel = '4. Configurando'; break;
        case 'success': progress = 100; stepLabel = '¡Listo!'; break;
        default: progress = 0;
    }

    if (currentStep === 'idle' || currentStep === 'error') return null;

    return (
        <View style={{ width: '100%', paddingHorizontal: 30, marginBottom: 20 }}>
            <Text style={{ color: '#888', fontSize: 12, marginBottom: 5, textAlign: 'center' }}>{stepLabel}</Text>
            <View style={{ height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ width: `${progress}%`, height: '100%', backgroundColor: '#00FF7F' }} />
            </View>
        </View>
    );
};

const AddDeviceScreen = ({ navigation }: AddDeviceScreenProps) => {
    const { token, wifiSsid, wifiPassword, setWifiCredentials } = useAuthStore();
    
    const [currentStep, setCurrentStep] = useState<Step>('idle');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');
    const [foundDevices, setFoundDevices] = useState<ShellyNetwork[]>([]);
    const [registeredMacs, setRegisteredMacs] = useState<Set<string>>(new Set());
    const [hasPermissions, setHasPermissions] = useState(false);

    const [isWifiModalVisible, setIsWifiModalVisible] = useState(false);
    const [tempSsid, setTempSsid] = useState('');
    const [tempPass, setTempPass] = useState('');

    const [selectedShellySSID, setSelectedShellySSID] = useState<string>('');
    const [userNetworkSSID, setUserNetworkSSID] = useState<string>('');

    useEffect(() => {
        initializeSetup();
    }, [token, wifiSsid, wifiPassword]);

    const initializeSetup = async () => {
        if (!token) {
            setError('Falta token. Inicia sesión nuevamente.');
            setCurrentStep('error');
            return;
        }
        if (!wifiSsid || !wifiPassword) {
            setIsWifiModalVisible(true);
            return;
        }
        await loadRegisteredDevices();
        await requestWifiPermissionsHandler();
    };

    const loadRegisteredDevices = async () => {
        try {
            const existing = await getDevices(token!);
            setRegisteredMacs(new Set(existing.map(d => d.dev_hardware_id.toUpperCase())));
        } catch (err) { setRegisteredMacs(new Set()); }
    };

    const requestWifiPermissionsHandler = async () => {
        if (Platform.OS !== 'android') {
            setHasPermissions(true);
            await scanForShellyNetworks();
            return;
        }
        setCurrentStep('requestingPermissions');
        setLoadingMessage('Solicitando permisos...');
        const granted = await requestWiFiPermissions();
        if (granted) {
            setHasPermissions(true);
            await scanForShellyNetworks();
        } else {
            setError('Permisos de ubicación requeridos para escanear WiFi.');
            setCurrentStep('error');
        }
    };

    const scanForShellyNetworks = async () => {
        setCurrentStep('scanningWifi');
        setLoadingMessage('Buscando dispositivos Shelly...');
        setFoundDevices([]);
        try {
            const currentSSID = await WifiManager.getCurrentWifiSSID();
            setUserNetworkSSID(currentSSID);
            const list = await WifiManager.loadWifiList();
            const shellyNets = list.filter((w: any) => {
                const s = w.SSID.toLowerCase();
                return s.startsWith('shelly') || s.startsWith('shellypro') || s.startsWith('shellyplus');
            });

            if (shellyNets.length === 0) {
                setError('No se encontraron dispositivos Shelly.\nAsegúrate de estar cerca y que el LED parpadee.');
                setCurrentStep('error');
            } else {
                setFoundDevices(shellyNets);
                setCurrentStep('deviceList');
            }
        } catch (e: any) {
            setError('Error escaneando: ' + e.message);
            setCurrentStep('error');
        }
    };

    const extractMacFromSSID = (ssid: string) => {
        const m = ssid.match(/[A-Fa-f0-9]{12}$/);
        return m ? m[0].toUpperCase() : null;
    };

    const handleDeviceSelection = (device: ShellyNetwork) => {
        const mac = extractMacFromSSID(device.SSID);
        if (mac && registeredMacs.has(mac)) {
            Alert.alert('Ya registrado', `El dispositivo ${mac} ya está en tu cuenta.`);
            return;
        }
        Alert.alert('Conectar a Shelly', `¿Configurar "${device.SSID}" para EcoWatt?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Conectar', onPress: () => connectToShelly(device) }
        ]);
    };

    const verifyConnection = async (targetSSID: string) => {
        for (let i = 0; i < 10; i++) {
            try {
                const curr = await WifiManager.getCurrentWifiSSID();
                if (curr === targetSSID) return true;
                await new Promise<void>(r => setTimeout(() => r(), 1000));
            } catch (e) {}
        }
        return false;
    };

    const connectToShelly = async (device: ShellyNetwork) => {
        setCurrentStep('connecting');
        setLoadingMessage(`Conectando a ${device.SSID}...`);
        setSelectedShellySSID(device.SSID);
        try {
            await WifiManager.connectToProtectedSSID(device.SSID, '', false, false);
            const connected = await verifyConnection(device.SSID);
            if (connected) await configureShelly();
            else throw new Error('No se pudo establecer conexión con el dispositivo.');
        } catch (e: any) {
            setError(e.message);
            setCurrentStep('error');
        }
    };

    const fetchWithTimeout = async (url: string, opts: RequestInit, ms: number) => {
        const c = new AbortController();
        const id = setTimeout(() => c.abort(), ms);
        try {
            const res = await fetch(url, { ...opts, signal: c.signal });
            clearTimeout(id);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) { clearTimeout(id); throw e; }
    };

    // 🔥 CONFIGURACIÓN PRINCIPAL CORREGIDA
    const configureShelly = async () => {
        setCurrentStep('configuring');
        const shellyIP = '192.168.33.1';
        
        try {
            setLoadingMessage('Identificando dispositivo...');
            let mqttPrefix = 'shellyplus1pm';
            let deviceMac = '';
            let deviceName = '';

            // 1. Obtener identidad
            try {
                const sysData = await fetchWithTimeout(`http://${shellyIP}/rpc/Sys.GetStatus`, {
                    method: 'POST', body: JSON.stringify({ id: 1, method: "Sys.GetStatus" })
                }, 5000);
                if (sysData.src && sysData.src.includes('-')) {
                    const parts = sysData.src.split('-');
                    mqttPrefix = parts[0]; 
                    deviceMac = parts[1]; 
                }
            } catch (e) {
                console.warn('⚠️ Sys.GetStatus falló, intentando GetDeviceInfo...');
            }

            if (!deviceMac) {
                const info = await fetchWithTimeout(`http://${shellyIP}/rpc/Shelly.GetDeviceInfo`, { method: 'GET' }, 5000);
                deviceMac = info.mac || info.id;
                deviceName = info.name || info.app;
            }

            // 🔥 CRÍTICO: FORMATO DE MAC
            // DB y Script (API): MAYÚSCULAS
            const finalMac = deviceMac.toUpperCase(); 
            // MQTT (Cliente): MINÚSCULAS (Obligatorio por Shelly Gen2)
            const mqttClientId = `${mqttPrefix}-${finalMac.toLowerCase()}`; 
            
            console.log(`✅ Identidad confirmada. DB: ${finalMac} | MQTT: ${mqttClientId}`);

            // --- PASO 1: Configurar MQTT ---
            setLoadingMessage('Configurando servidor MQTT...');
            await fetchWithTimeout(`http://${shellyIP}/rpc/Mqtt.SetConfig`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: {
                        enable: true,
                        server: MQTT_CONFIG.server,
                        user: MQTT_CONFIG.user,
                        pass: MQTT_CONFIG.pass,
                        client_id: mqttClientId,     // Minúsculas
                        topic_prefix: mqttClientId,  // Minúsculas
                        rpc_ntf: true,
                        status_ntf: true,
                        enable_rpc: true,
                        enable_control: true
                    }
                })
            }, 10000);

            // --- PASO 2: Instalar Script de Monitoreo (MÉTODO SEGURO: PutCode) ---
            setLoadingMessage('Instalando script de consumo...');
            
            // Script optimizado para TU API
            const monitoringScript = `
let CONFIG = {
    webhook_url: "${INGESTION_URL}",
    interval: 10000 
};

function publishData() {
    Shelly.call("Switch.GetStatus", {id: 0}, function(result) {
        if (!result) return;
        
        let payload = {
            "switch:0": {
                id: 0,
                apower: result.apower || 0,
                voltage: result.voltage || 0,
                current: result.current || 0,
                output: result.output || false,
                temperature: result.temperature || {tC: 0, tF: 0}
            },
            "sys": {
                mac: "${finalMac}" 
            }
        };
        
        Shelly.call("HTTP.POST", {
            url: CONFIG.webhook_url,
            body: JSON.stringify(payload),
            content_type: "application/json"
        }, function(res) {
            // Callback opcional
        });
    });
}

Timer.set(CONFIG.interval, true, publishData);
publishData();
`;

            // A) Crear archivo VACÍO (Solo el nombre)
            // Esto evita que el Shelly se atragante creando y escribiendo a la vez
            const createRes = await fetchWithTimeout(`http://${shellyIP}/rpc/Script.Create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: "ecowatt_ingest" })
            }, 5000);

            // Obtenemos el ID del script creado
            const scriptId = createRes.id || 1;

            // B) Inyectar el código usando PutCode (Mucho más robusto para textos largos)
            await fetchWithTimeout(`http://${shellyIP}/rpc/Script.PutCode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: scriptId, 
                    code: monitoringScript 
                })
            }, 8000);

            // C) Habilitar Script
            await fetchWithTimeout(`http://${shellyIP}/rpc/Script.SetConfig`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: scriptId, config: { enable: true } })
            }, 5000);

            // D) Iniciar Script
            await fetchWithTimeout(`http://${shellyIP}/rpc/Script.Start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: scriptId })
            }, 5000);

            // --- PASO 3: Configurar WiFi ---
            setLoadingMessage('Configurando WiFi del Shelly...');
            await fetchWithTimeout(`http://${shellyIP}/rpc/WiFi.SetConfig`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: { sta: { ssid: wifiSsid, pass: wifiPassword, enable: true, ipv4mode: 'dhcp' } }
                })
            }, 5000);

            // --- PASO 4: Reinicio ---
            setLoadingMessage('Reiniciando dispositivo...');
            try {
                await fetch(`http://${shellyIP}/rpc/Shelly.Reboot`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
            } catch (e) { /* Error esperado */ }

            setLoadingMessage('Esperando reinicio del dispositivo...');
            await new Promise<void>(resolve => setTimeout(() => resolve(), 8000));
            
            setLoadingMessage('Volviendo a tu red WiFi...');
            await reconnectToUserNetwork();

            // --- PASO 5: Registro ---
            await registerShellyDevice(deviceName || `Shelly ${mqttPrefix}`, finalMac, mqttPrefix);

        } catch (e: any) {
            console.error('❌ Error en configuración:', e);
            setError('Error durante la configuración: ' + e.message);
            setCurrentStep('error');
            reconnectToUserNetwork();
        }
    };

    const reconnectToUserNetwork = async () => {
        try {
            if (userNetworkSSID && wifiPassword) {
                await WifiManager.connectToProtectedSSID(userNetworkSSID, wifiPassword, false, false);
                await verifyConnection(userNetworkSSID);
            }
        } catch (e) { 
            Alert.alert('Reconectar Manualmente', `Por favor, reconéctate a tu WiFi: ${userNetworkSSID}`); 
        }
    };

    const registerShellyDevice = async (name: string, mac: string, mqttPrefix: string) => {
        try {
            setLoadingMessage('Registrando en EcoWatt...');
            
            // Registramos con la MAC en Mayúsculas (Como la espera la BD)
            const registeredDevice = await registerDevice(token!, {
                dev_name: name,
                dev_hardware_id: mac,
                dev_mqtt_prefix: mqttPrefix
            });
            
            console.log('✅ Dispositivo registrado - ID:', registeredDevice.dev_id);
            setCurrentStep('success');

            // 🔥 FORZAR APAGADO INMEDIATAMENTE
            // Esto es por seguridad, para que el dispositivo no arranque encendido
            const ensureDeviceOff = async () => {
                console.log('🌑 Asegurando que el dispositivo esté apagado...');
                for (let i = 0; i < 8; i++) {
                    try {
                        const delay = i === 0 ? 2000 : 3000;
                        await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
                        
                        // Enviamos comando de apagado a la API
                        await setDeviceState(token!, registeredDevice.dev_id, false);
                        console.log('✅ ¡Dispositivo apagado exitosamente!');
                        return;
                    } catch (e: any) {
                        console.log(`⏳ Intento apagado ${i+1}/8 falló`);
                    }
                }
            };

            ensureDeviceOff(); // Ejecutar en segundo plano

        } catch (e: any) {
            console.error('❌ Error al registrar:', e);
            setError('Error al registrar en la App: ' + e.message);
            setCurrentStep('error');
        }
    };

    const handleSaveWifi = () => {
        if (!tempSsid || !tempPass) { 
            Alert.alert('Campos Incompletos', 'Ingresa SSID y Contraseña.'); 
            return; 
        }
        setWifiCredentials(tempSsid, tempPass);
        setIsWifiModalVisible(false);
    };

    const renderWifiModal = () => (
        <Modal visible={isWifiModalVisible} transparent={true} animationType="slide" onRequestClose={() => navigation.goBack()}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Icon name="wifi" size={50} color="#00FF7F" style={{marginBottom: 20}} />
                    <Text style={styles.modalTitle}>Configurar WiFi</Text>
                    <TextInput style={styles.modalInput} placeholder="Red WiFi" value={tempSsid} onChangeText={setTempSsid} autoCapitalize="none"/>
                    <TextInput style={styles.modalInput} placeholder="Contraseña" value={tempPass} onChangeText={setTempPass} secureTextEntry autoCapitalize="none"/>
                    <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveWifi}><Text style={styles.modalButtonText}>Guardar</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={() => navigation.goBack()}><Text style={styles.modalCancelText}>Cancelar</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderContent = () => {
        if (isWifiModalVisible) return null;
        if (currentStep === 'success') {
            return (
                <View style={styles.centered}>
                    <Icon name="check-circle" size={80} color="#00FF7F" />
                    <Text style={styles.successText}>¡Configuración Exitosa!</Text>
                    <Text style={styles.loadingText}>WiFi configurado y conectado a EcoWatt Cloud.</Text>
                    <TouchableOpacity style={[styles.button, {marginTop: 30}]} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Finalizar</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if (currentStep === 'error') {
            return (
                <View style={styles.centered}>
                    <Icon name="times-circle" size={80} color="#FF6347" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => { setError(''); requestWifiPermissionsHandler(); }}>
                        <Text style={styles.buttonText}>Reintentar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, {backgroundColor: '#666', marginTop: 10}]} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Salir</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.centered}>
                <ProgressBar currentStep={currentStep} />
                {currentStep === 'deviceList' ? (
                    <FlatList
                        data={foundDevices}
                        keyExtractor={(i) => i.BSSID}
                        renderItem={({ item }) => {
                            const deviceMac = extractMacFromSSID(item.SSID);
                            const isRegistered = deviceMac ? registeredMacs.has(deviceMac) : false;
                            return (
                                <TouchableOpacity style={[styles.deviceItem, isRegistered && {opacity: 0.5}]} onPress={() => handleDeviceSelection(item)} disabled={isRegistered}>
                                    <Icon name={isRegistered ? "check-circle" : "wifi"} size={24} color={isRegistered ? "#888" : "#00FF7F"} />
                                    <View style={styles.deviceInfo}>
                                        <Text style={styles.deviceName}>{item.SSID} {isRegistered && "(Registrado)"}</Text>
                                        <Text style={styles.deviceId}>Señal: {item.level} dBm</Text>
                                    </View>
                                    {!isRegistered && <Icon name="chevron-right" size={16} color="#00FF7F" />}
                                </TouchableOpacity>
                            );
                        }}
                        contentContainerStyle={{width:'100%'}}
                        ListFooterComponent={
                            <View style={{padding: 20}}>
                                <TouchableOpacity style={styles.button} onPress={scanForShellyNetworks}>
                                    <Icon name="sync-alt" size={16} color="#0A192F" style={{marginRight: 8}} />
                                    <Text style={styles.buttonText}>Buscar de Nuevo</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                ) : (
                    <>
                        <ActivityIndicator size="large" color="#00FF7F" />
                        <Text style={styles.loadingText}>{loadingMessage}</Text>
                    </>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderContent()}
            {renderWifiModal()}
        </SafeAreaView>
    );
};

export default AddDeviceScreen;