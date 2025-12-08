import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ImageBackground, StatusBar,
    ScrollView, ActivityIndicator, Dimensions, AppState,
    TouchableOpacity, Modal, Alert, StyleSheet, Animated
} from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts'; 
import Icon from 'react-native-vector-icons/FontAwesome5';

import { statsStyles } from '../styles/StatsStyles';
import { useAuthStore } from '../store/useAuthStore';
import { getHistoryGraph, HistoryDataPoint, getDevices } from '../services/authService';
import SkeletonLoader from '../components/SkeletonLoader';
import { generateEcoWattReport } from '../services/PDFGenerator'; 
import { getMonthlyReport, getCurrentMonthlyReport, MonthlyReportData } from '../services/reportService'; 
import { requestStoragePermission } from '../utils/permissions';

const ECOWATT_BACKGROUND = require('../assets/fondo.jpg');
const PRIMARY_GREEN = '#00FF7F';
const ACCENT_GREEN = 'rgba(0, 255, 127, 0.15)'; 
const LIVE_COLOR = '#FF4500'; 
const CARD_BG = 'rgba(20, 20, 30, 0.75)'; 
const BORDER_COLOR = 'rgba(255, 255, 255, 0.1)';

const screenWidth = Dimensions.get('window').width;

type ChartDataItem = {
    value: number;
    label: string;
    frontColor?: string;
    focusable?: boolean;
    dataPointText?: string;
};

const MAX_REALTIME_POINTS = 30;

// 🔥 COMPONENTE: ETIQUETA EN VIVO PULSANTE
const LivePulseBadge = ({ status }: { status: string }) => {
    const opacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (status === 'connected') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        } else {
            opacity.setValue(1);
        }
    }, [status]);

    const getStatusConfig = () => {
        if (status === 'connected') return { color: LIVE_COLOR, text: 'EN VIVO', icon: 'circle' };
        if (status === 'connecting') return { color: '#FFA500', text: 'CONECTANDO', icon: 'sync' };
        return { color: '#666', text: 'OFFLINE', icon: 'times-circle' };
    };

    const config = getStatusConfig();

    return (
        <View style={{ 
            flexDirection: 'row', alignItems: 'center', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            paddingHorizontal: 10, paddingVertical: 5, 
            borderRadius: 20, borderWidth: 1, borderColor: config.color 
        }}>
            <Animated.View style={{
                width: 8, height: 8, borderRadius: 4, 
                backgroundColor: config.color, marginRight: 8,
                opacity: status === 'connected' ? opacity : 1,
                shadowColor: config.color, shadowOffset: {width:0,height:0}, shadowOpacity: 1, shadowRadius: 5
            }} />
            <Text style={{ color: config.color, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>
                {config.text}
            </Text>
        </View>
    );
};

const StatsScreen = () => {
    const { token, logout } = useAuthStore();

    const [dailyData, setDailyData] = useState<ChartDataItem[]>([]);
    const [weeklyData, setWeeklyData] = useState<ChartDataItem[]>([]);
    const [monthlyData, setMonthlyData] = useState<ChartDataItem[]>([]);
    
    const [isLoadingHistory, setIsLoadingHistory] = useState(true); 
    const [deviceId, setDeviceId] = useState<number | null>(null);
    const [realtimeData, setRealtimeData] = useState<ChartDataItem[]>([]);
    const [currentWatts, setCurrentWatts] = useState<number | null>(null);
    const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [maxChartValue, setMaxChartValue] = useState(100); 
    
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 3;

    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const [selectedDailyDate, setSelectedDailyDate] = useState(new Date());
    const [selectedWeeklyDate, setSelectedWeeklyDate] = useState(new Date());
    const [selectedMonthlyDate, setSelectedMonthlyDate] = useState(new Date());
    const [showDailyPicker, setShowDailyPicker] = useState(false);
    const [showWeeklyPicker, setShowWeeklyPicker] = useState(false);
    const [showMonthlyPicker, setShowMonthlyPicker] = useState(false);

    // --- HELPERS ---
    const formatDateLabel = (timestamp: string, format: 'hour' | 'weekday' | 'dayMonth') => {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '?';
        if (format === 'hour') {
            let hours = date.getHours();
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12; hours = hours ? hours : 12; 
            return `${hours}${ampm}`;
        }
        if (format === 'weekday') return date.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '').toUpperCase(); 
        if (format === 'dayMonth') return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '');
        return '';
    };

    const generateOptions = (type: 'daily' | 'weekly' | 'monthly') => {
        const options = [];
        const today = new Date();
        const limit = type === 'daily' ? 30 : 12;
        for (let i = 0; i < limit; i++) {
            const date = new Date(today);
            if (type === 'daily') date.setDate(today.getDate() - i);
            else if (type === 'weekly') date.setDate(today.getDate() - (i * 7));
            else date.setMonth(today.getMonth() - i);
            options.push(date);
        }
        return options;
    };

    const formatLabel = (date: Date, type: 'daily' | 'weekly' | 'monthly') => {
        if (type === 'daily') return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
        if (type === 'monthly') return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        
        const start = new Date(date); start.setDate(date.getDate() - date.getDay());
        const end = new Date(start); end.setDate(start.getDate() + 6);
        return `${start.getDate()} ${start.toLocaleDateString('es-MX',{month:'short'})} - ${end.getDate()} ${end.toLocaleDateString('es-MX',{month:'short'})}`;
    };

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadAllData = async () => {
            if (!token) { setIsLoadingHistory(false); setTimeout(logout, 100); return; }
            try {
                const devices = await getDevices(token);
                if (devices.length > 0) setDeviceId(devices[0].dev_id);
            } catch (e) {}

            setIsLoadingHistory(true);
            try {
                const [d, w, m] = await Promise.allSettled([
                    getHistoryGraph(token, 'daily'),
                    getHistoryGraph(token, 'weekly'),
                    getHistoryGraph(token, 'monthly'),
                ]);

                const processData = (res: any, fmt: any) => 
                    res.status === 'fulfilled' && res.value.data_points 
                    ? res.value.data_points.map((p: any) => ({ value: p.value, label: formatDateLabel(p.timestamp, fmt), frontColor: PRIMARY_GREEN })) 
                    : [];

                setDailyData(processData(d, 'hour'));
                setWeeklyData(processData(w, 'weekday'));
                setMonthlyData(processData(m, 'dayMonth'));

            } catch (err) { console.error(err); } 
            finally { setTimeout(() => setIsLoadingHistory(false), 500); }
        };
        loadAllData();
    }, [token]);

    // --- WEBSOCKET MEJORADO ---
    useEffect(() => {
        const connectWebSocket = () => {
            if (!token || !deviceId) return;
            if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) return;

            setWsStatus('connecting');
            const socket = new WebSocket(`wss://core-cloud.dev/ws/live/${deviceId}?token=${token}`);

            socket.onopen = () => { setWsStatus('connected'); reconnectAttemptsRef.current = 0; };
            
            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    // 🔥 FIX: Aceptamos watts, apower, power o value
                    const val = message.watts ?? message.apower ?? message.power ?? message.value;
                    
                    if (typeof val === 'number') {
                        setCurrentWatts(val);
                        setMaxChartValue(prev => Math.max(prev, val * 1.3));
                        setRealtimeData(prev => {
                            const newData = [...prev, { value: val, label: '', frontColor: LIVE_COLOR }];
                            return newData.length > MAX_REALTIME_POINTS ? newData.slice(newData.length - MAX_REALTIME_POINTS) : newData;
                        });
                    }
                } catch (e) {}
            };

            socket.onerror = () => setWsStatus('error');
            socket.onclose = (e) => {
                ws.current = null;
                setWsStatus('disconnected');
                if (e.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttemptsRef.current++;
                    reconnectTimeoutRef.current = setTimeout(connectWebSocket, 1000 * reconnectAttemptsRef.current);
                } else {
                    setRealtimeData([{ value: 0, label: '', frontColor: LIVE_COLOR }]);
                }
            };
            ws.current = socket; 
        };

        const disconnect = () => { if(ws.current) ws.current.close(); if(reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current); };
        disconnect();
        if (deviceId) connectWebSocket();
        return () => disconnect();
    }, [token, deviceId]);

    // --- REPORTE ---
    const handleGenerateReport = async () => {
        if (!token) return;
        if (!(await requestStoragePermission())) return; 
        setIsGeneratingReport(true);
        try {
            const isCurrent = selectedMonthlyDate.getMonth() === new Date().getMonth();
            const reportData = isCurrent ? await getCurrentMonthlyReport(token) : await getMonthlyReport(token, selectedMonthlyDate.getMonth() + 1, selectedMonthlyDate.getFullYear());
            const res = await generateEcoWattReport(reportData);
            Alert.alert(res.success ? "¡Listo!" : "Error", res.success ? "PDF generado correctamente." : "No se pudo crear el PDF.");
        } catch (e) { Alert.alert("Aviso", "Sin datos suficientes."); } 
        finally { setIsGeneratingReport(false); }
    };

    const calcMax = (data: ChartDataItem[]) => data.length ? Math.max(...data.map(d => d.value)) * 1.2 : 10;
    const chartWidth = screenWidth - 60; // Ajustado para padding

    // --- UI HELPERS ---
    const renderTooltip = (item: any) => (
        <View style={localStyles.tooltip}>
            <Text style={localStyles.tooltipText}>{item.value.toFixed(2)} W</Text>
        </View>
    );

    const DatePickerModal = ({ visible, onClose, options, selectedDate, onSelect, type }: any) => (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={statsStyles.modalBackground}>
                <View style={statsStyles.modalContainer}>
                    <View style={statsStyles.modalHeader}>
                        <Text style={statsStyles.modalTitle}>Seleccionar Fecha</Text>
                        <TouchableOpacity onPress={onClose}><Icon name="times" size={20} color="#fff" /></TouchableOpacity>
                    </View>
                    <ScrollView style={statsStyles.modalScroll}>
                        {options.map((date: Date, index: number) => (
                            <TouchableOpacity key={index} style={[statsStyles.dateOption, date.toDateString() === selectedDate.toDateString() && statsStyles.dateOptionSelected]} onPress={() => { onSelect(date); onClose(); }}>
                                <Text style={[statsStyles.dateOptionText, date.toDateString() === selectedDate.toDateString() && statsStyles.dateOptionTextSelected]}>
                                    {formatLabel(date, type)}
                                </Text>
                                {date.toDateString() === selectedDate.toDateString() && <Icon name="check" size={12} color="#000" />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const hasRealtimeData = realtimeData.length > 1 || (realtimeData[0]?.value ?? 0) > 0;

    return (
        <ImageBackground source={ECOWATT_BACKGROUND} style={statsStyles.container} resizeMode="cover" blurRadius={3}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
            <View style={localStyles.overlay} />

            <ScrollView contentContainerStyle={statsStyles.scrollViewContent}>
                <View style={localStyles.mainHeader}>
                    <Text style={statsStyles.headerTitle}>Monitor de Energía</Text>
                    <Icon name="bolt" size={24} color={PRIMARY_GREEN} />
                </View>

                {/* --- CARD: TIEMPO REAL --- */}
                <View style={localStyles.glassCard}>
                    <View style={localStyles.cardHeaderRow}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Icon name="tachometer-alt" size={16} color="#bbb" style={{marginRight:8}} />
                            <Text style={localStyles.cardTitle}>Consumo Actual</Text>
                        </View>
                        <LivePulseBadge status={wsStatus} />
                    </View>
                    
                    <View style={localStyles.wattsContainer}>
                        {wsStatus === 'connecting' ? (
                            <ActivityIndicator size="large" color={PRIMARY_GREEN} style={{marginVertical: 20}} />
                        ) : (
                            <>
                                <Text style={localStyles.wattsNumber}>
                                    {currentWatts !== null ? currentWatts.toFixed(0) : '---'}
                                </Text>
                                <Text style={localStyles.wattsUnit}>WATTS</Text>
                            </>
                        )}
                    </View>
                    
                    {!hasRealtimeData && wsStatus === 'disconnected' && (
                        <Text style={localStyles.noDataText}>Dispositivo desconectado</Text>
                    )}
                    
                    <View style={localStyles.chartWrapper}>
                        {/* ⚠️ CORRECCIÓN: Se eliminó hideAxes para arreglar el error de TypeScript */}
                        <LineChart
                            areaChart
                            curved
                            data={hasRealtimeData ? realtimeData : [{ value: 0 }]}
                            height={120}
                            width={chartWidth}
                            spacing={chartWidth / MAX_REALTIME_POINTS}
                            color={LIVE_COLOR}
                            startFillColor={LIVE_COLOR}
                            endFillColor={LIVE_COLOR}
                            startOpacity={0.4}
                            endOpacity={0.0}
                            hideRules hideYAxisText hideDataPoints hideAxesAndRules
                            maxValue={maxChartValue}
                            initialSpacing={0}
                        />
                    </View>
                </View>

                {/* --- CARD: DIARIO --- */}
                <View style={localStyles.glassCard}>
                    <View style={localStyles.cardHeaderRow}>
                        <Text style={localStyles.cardTitle}>Historial Diario</Text>
                        <TouchableOpacity style={localStyles.dateButton} onPress={() => setShowDailyPicker(true)}>
                            <Text style={localStyles.dateButtonText}>{formatLabel(selectedDailyDate, 'daily')}</Text>
                            <Icon name="chevron-down" size={10} color={PRIMARY_GREEN} />
                        </TouchableOpacity>
                    </View>
                    {isLoadingHistory ? <SkeletonLoader width="100%" height={180} borderRadius={15} /> : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <BarChart 
                                data={dailyData} barWidth={18} spacing={20} roundedTop 
                                frontColor={PRIMARY_GREEN}
                                rulesColor="rgba(255,255,255,0.1)" 
                                yAxisTextStyle={{color:'#888', fontSize:10}} 
                                xAxisLabelTextStyle={{color:'#ccc', fontSize:10}} 
                                hideYAxisText={false}
                                xAxisThickness={0} yAxisThickness={0} 
                                maxValue={calcMax(dailyData)} noOfSections={4} 
                                isAnimated renderTooltip={renderTooltip}
                            />
                        </ScrollView>
                    )}
                </View>

                {/* --- CARD: SEMANAL --- */}
                <View style={localStyles.glassCard}>
                    <View style={localStyles.cardHeaderRow}>
                        <Text style={localStyles.cardTitle}>Historial Semanal</Text>
                        <TouchableOpacity style={localStyles.dateButton} onPress={() => setShowWeeklyPicker(true)}>
                            <Text style={localStyles.dateButtonText}>{formatLabel(selectedWeeklyDate, 'weekly').split('-')[0]}...</Text>
                            <Icon name="chevron-down" size={10} color={PRIMARY_GREEN} />
                        </TouchableOpacity>
                    </View>
                    {isLoadingHistory ? <SkeletonLoader width="100%" height={180} borderRadius={15} /> : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <BarChart 
                                data={weeklyData} barWidth={28} spacing={25} roundedTop
                                frontColor={PRIMARY_GREEN}
                                rulesColor="rgba(255,255,255,0.1)" 
                                yAxisTextStyle={{color:'#888', fontSize:10}} 
                                xAxisLabelTextStyle={{color:'#ccc', fontSize:10}} 
                                xAxisThickness={0} yAxisThickness={0} 
                                maxValue={calcMax(weeklyData)} noOfSections={4} 
                                isAnimated renderTooltip={renderTooltip}
                            />
                        </ScrollView>
                    )}
                </View>

                {/* --- CARD: MENSUAL & REPORTE --- */}
                <View style={localStyles.glassCard}>
                    <View style={localStyles.cardHeaderRow}>
                        <Text style={localStyles.cardTitle}>Reportes</Text>
                        <TouchableOpacity style={localStyles.actionButton} onPress={handleGenerateReport} disabled={isGeneratingReport}>
                            {isGeneratingReport ? <ActivityIndicator size="small" color="#fff" /> : <><Icon name="file-pdf" size={14} color="#fff" style={{marginRight:6}} /><Text style={localStyles.actionButtonText}>PDF</Text></>}
                        </TouchableOpacity>
                    </View>
                    <View style={{marginBottom:15}}>
                         <TouchableOpacity style={localStyles.dateButton} onPress={() => setShowMonthlyPicker(true)}>
                            <Text style={localStyles.dateButtonText}>{formatLabel(selectedMonthlyDate, 'monthly')}</Text>
                            <Icon name="chevron-down" size={10} color={PRIMARY_GREEN} />
                        </TouchableOpacity>
                    </View>
                    {isLoadingHistory ? <SkeletonLoader width="100%" height={180} borderRadius={15} /> : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <BarChart 
                                data={monthlyData} barWidth={28} spacing={25} roundedTop
                                frontColor={PRIMARY_GREEN}
                                rulesColor="rgba(255,255,255,0.1)" 
                                yAxisTextStyle={{color:'#888', fontSize:10}} 
                                xAxisLabelTextStyle={{color:'#ccc', fontSize:10}} 
                                xAxisThickness={0} yAxisThickness={0} 
                                maxValue={calcMax(monthlyData)} noOfSections={4} 
                                isAnimated renderTooltip={renderTooltip}
                            />
                        </ScrollView>
                    )}
                </View>

            </ScrollView>

            <DatePickerModal visible={showDailyPicker} onClose={()=>setShowDailyPicker(false)} options={generateOptions('daily')} selectedDate={selectedDailyDate} onSelect={setSelectedDailyDate} formatLabel={(d: Date)=>formatLabel(d,'daily')} type='daily'/>
            <DatePickerModal visible={showWeeklyPicker} onClose={()=>setShowWeeklyPicker(false)} options={generateOptions('weekly')} selectedDate={selectedWeeklyDate} onSelect={setSelectedWeeklyDate} formatLabel={(d: Date)=>formatLabel(d,'weekly')} type='weekly'/>
            <DatePickerModal visible={showMonthlyPicker} onClose={()=>setShowMonthlyPicker(false)} options={generateOptions('monthly')} selectedDate={selectedMonthlyDate} onSelect={setSelectedMonthlyDate} formatLabel={(d: Date)=>formatLabel(d,'monthly')} type='monthly'/>
        </ImageBackground>
    );
};

const localStyles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    mainHeader: {
        marginTop: 50, marginBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    glassCard: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        marginHorizontal: 15,
        marginBottom: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    cardHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15
    },
    cardTitle: {
        fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.5
    },
    wattsContainer: {
        alignItems: 'center', marginVertical: 10
    },
    wattsNumber: {
        fontSize: 48, fontWeight: '800', color: '#fff',
        textShadowColor: 'rgba(0, 255, 127, 0.5)', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 15
    },
    wattsUnit: {
        fontSize: 12, color: PRIMARY_GREEN, fontWeight: 'bold', letterSpacing: 2, marginTop: -5
    },
    chartWrapper: {
        height: 120, overflow: 'hidden', borderRadius: 15, marginTop: 10
    },
    dateButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: ACCENT_GREEN,
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12,
        borderWidth: 1, borderColor: PRIMARY_GREEN
    },
    dateButtonText: {
        color: PRIMARY_GREEN, fontSize: 11, fontWeight: '700', marginRight: 6
    },
    actionButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#333',
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12,
        borderWidth: 1, borderColor: '#555'
    },
    actionButtonText: {
        color: '#fff', fontSize: 11, fontWeight: '700'
    },
    tooltip: {
        backgroundColor: '#1a1a1a', padding: 8, borderRadius: 8,
        borderWidth: 1, borderColor: PRIMARY_GREEN, marginBottom: 5
    },
    tooltipText: {
        color: '#fff', fontSize: 12, fontWeight: 'bold'
    },
    noDataText: {
        textAlign: 'center', color: '#666', fontSize: 12, marginVertical: 10
    }
});

export default StatsScreen;