import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNotificationStore } from '../store/useNotificationStore'; 
import { styles } from '../styles/NotificationsStyles'; 
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator'; 

// 🔥 IMPORTAMOS EL SKELETON
import SkeletonLoader from '../components/SkeletonLoader';

type NotificationsScreenProps = StackScreenProps<RootStackParamList, 'Notifications'>;

const NotificationItem = ({ item, markAsRead }: any) => {
    
    const formatDate = (isoDateString: string) => {
        const date = new Date(isoDateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <TouchableOpacity 
            style={[styles.item, item.read ? styles.itemRead : styles.itemUnread]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
        >
            <View style={localStyles.row}>
                {/* Icono de estado */}
                <View style={[localStyles.iconBox, { backgroundColor: item.read ? '#eee' : 'rgba(0, 255, 127, 0.1)' }]}>
                    <Icon 
                        name={item.read ? 'bell' : 'bell'} 
                        size={18} 
                        color={item.read ? '#AAA' : styles.primaryGreen.color} 
                        solid={!item.read}
                    />
                </View>

                <View style={styles.textContainer}>
                    <View style={localStyles.headerRow}>
                        <Text style={[styles.title, !item.read && { color: '#000', fontWeight: 'bold' }]}>
                            {item.title}
                        </Text>
                        {!item.read && <View style={localStyles.dot} />}
                    </View>
                    
                    <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                    <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
    const { notifications, markAsRead, markAllAsRead, unreadCount, clearAll } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(true);

    // Simulamos carga inicial breve para consistencia visual
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    // Renderizado del Skeleton (Carga)
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notificaciones</Text>
                </View>
                <View style={{ padding: 20 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 20, alignItems: 'center' }}>
                            <SkeletonLoader width={40} height={40} borderRadius={20} style={{ marginRight: 15 }} />
                            <View style={{ flex: 1 }}>
                                <SkeletonLoader width="60%" height={15} style={{ marginBottom: 8 }} />
                                <SkeletonLoader width="90%" height={12} />
                            </View>
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Notificaciones {unreadCount > 0 ? `(${unreadCount})` : ''}
                </Text>
                
                {notifications.length > 0 && (
                    <TouchableOpacity onPress={markAllAsRead} style={styles.actionButton}>
                        <Icon name="check-double" size={18} color={styles.primaryGreen.color} />
                    </TouchableOpacity>
                )}
            </View>
            
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NotificationItem item={item} markAsRead={markAsRead} />}
                contentContainerStyle={[
                    notifications.length === 0 ? styles.listEmpty : null,
                    { paddingBottom: 80 } // Espacio para el botón flotante si lo hubiera
                ]}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="bell-slash" size={60} color="#DDD" style={{marginBottom: 15}} />
                        <Text style={styles.emptyText}>Estás al día</Text>
                        <Text style={{ color: '#999', fontSize: 14 }}>No tienes notificaciones nuevas.</Text>
                    </View>
                )}
            />
            
            {notifications.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => clearAll()} style={styles.clearAllButton}>
                        <Text style={styles.clearAllText}>Borrar todas</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00FF7F', // Punto verde indicador
        marginLeft: 5,
    }
});

export default NotificationsScreen;