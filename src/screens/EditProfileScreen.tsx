// src/screens/EditProfileScreen.tsx
import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, Alert,
    ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { updateUserProfile } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import styles from '../styles/EditProfileStyles'; 
import { RootStackParamList } from '../navigation/AppNavigator'; 

// 🔥 AÑADIDO: Importamos el componente visual mejorado
import CustomInput from '../components/CustomInput';

type EditProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ route, navigation }) => {
    const { currentUser } = route.params;
    const { token } = useAuthStore();

    const [name, setName] = useState(currentUser.user_name);
    const [email, setEmail] = useState(currentUser.user_email);
    const [billingDay, setBillingDay] = useState(currentUser.user_billing_day.toString()); 

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setError(''); 

        if (!name.trim() || !email.trim() || !billingDay.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        
        const dayNumber = parseInt(billingDay, 10);
        if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
            setError('El día de corte debe ser un número entre 1 y 31.');
            return;
        }

        setIsLoading(true);

        const updatedData: { user_name?: string; user_email?: string; user_billing_day?: number } = {};
        if (name !== currentUser.user_name) updatedData.user_name = name;
        if (email !== currentUser.user_email) updatedData.user_email = email;
        if (dayNumber !== currentUser.user_billing_day) updatedData.user_billing_day = dayNumber;

        if (Object.keys(updatedData).length === 0) {
            setIsLoading(false);
            Alert.alert('Sin Cambios', 'No has modificado ningún dato.');
            navigation.goBack(); 
            return;
        }

        try {
            if (!token) throw new Error("Token no encontrado");

            await updateUserProfile(token, updatedData);

            setIsLoading(false);
            Alert.alert('Éxito', 'Perfil actualizado correctamente.');
            navigation.goBack(); 

        } catch (err: any) {
            setError(err.message || 'No se pudo actualizar el perfil.');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={styles.saveButton.backgroundColor} />
                <Text style={styles.loadingText}>Guardando cambios...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Editar Perfil</Text>

                    {/* Campo Nombre (MEJORADO) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nombre Completo</Text>
                        <CustomInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Tu nombre completo"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Campo Email (MEJORADO) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <CustomInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="tu.correo@ejemplo.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Campo Día de Corte (MEJORADO) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Día de Corte (1-31)</Text>
                        <CustomInput
                            style={styles.input}
                            value={billingDay}
                            onChangeText={setBillingDay}
                            placeholder="Ej: 15"
                            keyboardType="number-pad" 
                            maxLength={2}
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Campo Tarifa CFE (No editable, se queda igual) */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Tarifa CFE (No editable)</Text>
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>{currentUser.user_trf_rate.toUpperCase()}</Text>
                        </View>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;