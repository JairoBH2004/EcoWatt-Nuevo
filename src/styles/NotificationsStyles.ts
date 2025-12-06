// NotificationsStyles.ts

import { StyleSheet } from 'react-native';

const PRIMARY_GREEN = '#00FF7F';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2A47', // Fondo principal oscuro
    },
    primaryGreen: {
        color: PRIMARY_GREEN,
    },
    
    // --- Header ---
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#34495E',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1, // Permite que el título ocupe el espacio
    },
    actionButton: {
        padding: 5,
        marginLeft: 10,
    },
    
    // --- List Items ---
    listEmpty: {
        flexGrow: 1, // Asegura que el contenedor vacío ocupe todo el espacio
    },
    item: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#34495E',
        alignItems: 'flex-start',
    },
    itemUnread: {
        backgroundColor: '#2C3E50', // Fondo para no leídas
    },
    itemRead: {
        backgroundColor: 'transparent', 
        opacity: 0.8,
    },
    icon: {
        marginRight: 15,
        marginTop: 3,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#FFFFFF',
    },
    body: {
        fontSize: 14,
        color: '#D5DBDB',
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: '#AAB7B8',
        marginTop: 8,
        fontStyle: 'italic',
    },
    
    // --- Empty State ---
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        height: '100%',
        minHeight: 300, 
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#AAA',
        textAlign: 'center',
    },
    
    // --- Footer ---
    footer: {
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#34495E',
        alignItems: 'center',
    },
    clearAllButton: {
        padding: 10,
    },
    clearAllText: {
        color: '#E74C3C', // Rojo para acción de borrar
        fontWeight: 'bold',
        fontSize: 15,
    }
});