// NotificationsScreen.tsx

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNotificationStore } from '../store/useNotificationStore'; // Asegúrate que la ruta sea correcta
import { styles } from '../styles/NotificationsStyles'; // Importamos los estilos separados
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator'; // Ajusta tu tipo de navegación

// Definimos el tipo de pantalla si usas un stack navigator (necesario para navigation)
type NotificationsScreenProps = StackScreenProps<RootStackParamList, 'Notifications'>;

// --- Componente de un Item de Notificación ---
const NotificationItem = ({ item, markAsRead }: any) => {
    
    // Función para formatear la fecha a un formato legible
    const formatDate = (isoDateString: string) => {
        const date = new Date(isoDateString);
        return `${date.toLocaleDateString()} a las ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <TouchableOpacity 
            style={[styles.item, item.read ? styles.itemRead : styles.itemUnread]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.8}
        >
            <Icon 
                name={item.read ? 'bell' : 'exclamation-circle'} 
                size={20} 
                color={item.read ? '#AAA' : styles.primaryGreen.color} 
                style={styles.icon} 
                solid={!item.read}
            />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
        </TouchableOpacity>
    );
};


// --- Pantalla Principal ---
const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
    // Obtenemos los datos y acciones del store
    const { notifications, markAsRead, markAllAsRead, unreadCount, clearAll } = useNotificationStore();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Alertas ({unreadCount} no leídas)</Text>
                
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
                contentContainerStyle={notifications.length === 0 ? styles.listEmpty : null}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="bell-slash" size={50} color="#AAA" style={{marginBottom: 10}} />
                        <Text style={styles.emptyText}>No tienes notificaciones recientes.</Text>
                    </View>
                )}
            />
            
            {notifications.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => clearAll()} style={styles.clearAllButton}>
                        <Text style={styles.clearAllText}>Limpiar Historial</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default NotificationsScreen;