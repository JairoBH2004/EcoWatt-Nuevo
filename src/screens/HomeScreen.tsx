import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StatusBar, TouchableOpacity,
    ImageBackground, Alert, ActivityIndicator, Button,
    Dimensions, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { BarChart } from 'react-native-chart-kit';

import { styles } from '../styles/HomeStyles';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import {
    getDashboardSummary, DashboardSummary,
    getUserProfile, UserProfile,
    getDevices, Device,
    getLast7DaysHistory
} from '../services/authService';

// 👇 IMPORTACIÓN DEL NUEVO COMPONENTE SKELETON
import SkeletonLoader from '../components/SkeletonLoader';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';

const ECOWATT_BACKGROUND = require('../assets/fondo.jpg');
const PRIMARY_GREEN = '#00FF7F';
const screenWidth = Dimensions.get("window").width;

const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type GraphData = {
    labels: string[];
    datasets: { data: number[] }[];
};

const defaultGraphData: GraphData = {
    labels: days.slice(-7),
    datasets: [{ data: Array(7).fill(0) }]
};

type HomeScreenProps = CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
    const { token, logout, setHasDevices } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estado para alternar la vista de CO2 a Árboles
    const [showTrees, setShowTrees] = useState(false);

    // Obtener el contador de notificaciones no leídas
    const unreadCount = useNotificationStore(state => state.unreadCount);

    // 1. EFECTO PARA CARGAR DATOS
    useEffect(() => {
        const loadInitialData = async () => {
            if (!token) {
                logout();
                return;
            }

            setIsLoading(true);
            setError('');
            setGraphData(null);

            try {
                const profileData = await getUserProfile(token);
                setProfile(profileData);

                let devicesData: Device[] = [];
                try {
                    devicesData = await getDevices(token);
                    setDevices(devicesData);
                } catch (err: any) {
                    if (err.message.includes('404')) {
                        setDevices([]); 
                    } else {
                        throw err; 
                    }
                }

                if (devicesData.length > 0) {
                    setHasDevices(true);

                    const [summaryData, historyData] = await Promise.all([
                        getDashboardSummary(token),
                        getLast7DaysHistory(token)
                    ]);
                    setSummary(summaryData);

                    // Lógica de Gráfica
                    if (historyData && historyData.labels && historyData.watts && historyData.labels.length > 0) {
                        const combinedData = historyData.labels.map((label: string, index: number) => ({
                            timestamp: label,
                            value: historyData.watts[index] || 0 
                        }));

                        combinedData.sort((a: any, b: any) => 
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );

                        const labels = combinedData.map((item: any) => {
                            const date = new Date(item.timestamp);
                            return days[date.getDay()]; 
                        });

                        const values = combinedData.map((item: any) => item.value);

                        setGraphData({
                            labels: labels,
                            datasets: [{ data: values }]
                        });
                    } else {
                        setGraphData(defaultGraphData);
                    }

                } else {
                    setHasDevices(false);
                    setSummary(null);
                    setGraphData(defaultGraphData);
                }

            } catch (err: any) {
                console.log("Error loading home screen data:", err);
                setError(err.message || "No se pudieron cargar los datos.");
                if (err.message.includes('401')) {
                    logout();
                }
            } finally {
                // Pequeño delay artificial para que se aprecie el Skeleton (opcional, puedes quitarlo)
                setTimeout(() => setIsLoading(false), 500);
            }
        };

        loadInitialData();
    }, [token, logout, setHasDevices]);


    // 🔥 VISTA DE CARGA (SKELETON LOADER)
    if (isLoading) {
        return (
            <ImageBackground source={ECOWATT_BACKGROUND} style={styles.container} resizeMode="cover">
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ padding: 20 }}>
                        {/* Header Skeleton */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View>
                                <SkeletonLoader width={150} height={25} style={{ marginBottom: 10 }} />
                                <SkeletonLoader width={100} height={15} />
                            </View>
                            <SkeletonLoader width={40} height={40} borderRadius={20} />
                        </View>

                        {/* Main Card Skeleton */}
                        <SkeletonLoader width="100%" height={120} borderRadius={16} style={{ marginBottom: 20 }} />

                        {/* Small Cards Row Skeleton */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <SkeletonLoader width={(screenWidth / 2) - 30} height={100} borderRadius={16} />
                            <SkeletonLoader width={(screenWidth / 2) - 30} height={100} borderRadius={16} />
                        </View>

                        {/* Recommendation Skeleton */}
                        <SkeletonLoader width="100%" height={60} borderRadius={12} style={{ marginBottom: 20 }} />

                        {/* Graph Skeleton */}
                        <SkeletonLoader width="100%" height={220} borderRadius={16} />
                    </View>
                </SafeAreaView>
            </ImageBackground>
        );
    }

    if (error) {
       return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={[styles.addButton, { marginVertical: 10 }]}
                    onPress={() => navigation.navigate('AddDevice')}
                >
                    <Text style={styles.addButtonText}>Añadir Dispositivo</Text>
                </TouchableOpacity>
                <View style={{ marginTop: 20 }}>
                    <Button title="Cerrar Sesión" onPress={logout} color="#E74C3C" />
                </View>
            </View>
        );
    }

    const renderContent = () => {
        if (devices.length === 0) {
             return (
                 <View style={styles.centeredContent}>
                     <Icon name="plus-circle" size={50} color={PRIMARY_GREEN} />
                     <Text style={styles.actionTitle}>¡Bienvenido a EcoWatt!</Text>
                     <Text style={styles.actionSubtitle}>
                          No tienes ningún dispositivo, agrega uno para comenzar.
                     </Text>
                     <TouchableOpacity
                         style={[styles.addButton, { marginVertical: 20 }]}
                         onPress={() => navigation.navigate('AddDevice')}
                     >
                         <Text style={styles.addButtonText}>Añadir Dispositivo</Text>
                     </TouchableOpacity>
                     <View style={{ marginTop: 40 }}>
                         <Button title="Cerrar Sesión" onPress={logout} color="#E74C3C" />
                     </View>
                 </View>
             );
        }

        return (
            <>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>¡Hola, {profile?.user_name?.split(' ')[0]}!</Text>
                        <Text style={styles.headerSubtitle}>Tu resumen de energía</Text>
                    </View>
                    <View style={styles.headerIconsContainer}>
                        <TouchableOpacity 
                            style={styles.menuButton} 
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Icon name="bell" size={24} color="#FFFFFF" solid />
                            {unreadCount > 0 && (
                                <View style={customStyles.notificationBadge}>
                                    <Text style={customStyles.notificationBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.mainCard}>
                    <Text style={styles.mainCardTitle}>Costo Estimado del Periodo</Text>
                    <Text style={styles.projectedCost}>${summary?.estimated_cost_mxn?.toFixed(2) || '0.00'} MXN</Text>
                    <Text style={styles.comparisonText}>Días en el ciclo: {summary?.days_in_cycle || 0}</Text>
                </View>

                <View style={styles.smallCardsContainer}>
                    <View style={styles.smallCard}>
                        <Icon name="bolt" size={24} color={PRIMARY_GREEN} />
                        <Text style={styles.smallCardValue}>{summary?.kwh_consumed_cycle?.toFixed(2) || 0} kWh</Text>
                        <Text style={styles.smallCardLabel}>Consumo del Ciclo</Text>
                    </View>
                    
                    {/* 🔥 CARD DE CO₂ INTERACTIVO CON INDICADOR VISUAL */}
                    <TouchableOpacity 
                        style={styles.smallCard}
                        onPress={() => setShowTrees(!showTrees)} 
                        activeOpacity={0.7} 
                    >
                        {/* Indicador visual de rotación en la esquina */}
                        <View style={{ position: 'absolute', top: 8, right: 8, opacity: 0.6 }}>
                             <Icon name="sync-alt" size={12} color={PRIMARY_GREEN} />
                        </View>

                        <Icon name={showTrees ? "tree" : "leaf"} size={24} color={PRIMARY_GREEN} />
                        
                        <Text style={styles.smallCardValue}>
                            {showTrees 
                                ? (summary?.carbon_footprint?.equivalent_trees_absorption_per_year?.toFixed(1) || 0) 
                                : (summary?.carbon_footprint?.co2_emitted_kg?.toFixed(1) || 0)
                            } 
                            {showTrees ? '' : ' kg'}
                        </Text>
                        
                        <Text style={styles.smallCardLabel}>
                            {showTrees ? "Árboles Eq." : "CO₂ Emitido"}
                        </Text>
                    </TouchableOpacity>
                    {/* 👆 FIN DEL CAMBIO */}
                </View>

                <View style={styles.recommendationCard}>
                    <Icon name="lightbulb" size={24} color="#003366" />
                    <Text style={styles.recommendationText}>{summary?.latest_recommendation || 'Aún no hay recomendaciones.'}</Text>
                </View>

                <View style={styles.graphContainer}>
                    <Text style={styles.graphTitle}>Consumo Últimos {graphData?.labels.length || 0} Días</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {!graphData ? (
                            // Placeholder con Skeleton si no hay datos gráficos
                            <SkeletonLoader 
                                width={screenWidth - 70} 
                                height={220} 
                                borderRadius={16} 
                                style={{ backgroundColor: '#1E2A47', opacity: 0.5 }} 
                            />
                        ) : (
                            <View>
                                <BarChart
                                    data={graphData}
                                    width={Math.max(screenWidth - 60, graphData.labels.length * 50)} 
                                    height={220}
                                    fromZero
                                    yAxisSuffix=" W"
                                    yAxisLabel=""
                                    chartConfig={chartConfig}
                                    verticalLabelRotation={0}
                                    showValuesOnTopOfBars={true}
                                    style={{ borderRadius: 16 }}
                                />
                            </View>
                        )}
                    </ScrollView>
                </View>
            </>
        );
    };

    return (
        <ImageBackground source={ECOWATT_BACKGROUND} style={styles.container} resizeMode="cover">
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {renderContent()}
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

const customStyles = StyleSheet.create({
    notificationBadge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: '#E74C3C',
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    notificationBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

const chartConfig = {
    backgroundColor: '#1E2A47',
    backgroundGradientFrom: '#1E2A47',
    backgroundGradientTo: '#1E2A47',
    decimalPlaces: 0, 
    color: (opacity = 1) => `rgba(0, 255, 127, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 16
    },
    barPercentage: 0.7, 
    propsForBackgroundLines: {
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeDasharray: '', 
    },
};

export default HomeScreen;