// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Image,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

// 🔥 CORRECCIÓN 1: Importar el tipo de navegación real
import { RootStackParamList } from '../navigation/AppNavigator'; 

// Importa la función del servicio (ya revisado)
import { requestPasswordReset } from '../services/authService';
// Importa los estilos específicos (Asegúrate de copiar ForgotPasswordStyles.ts)
import styles, { COLOR_PRIMARY_BLUE, COLOR_PRIMARY_GREEN } from '../styles/ForgotPasswordStyles'; 

const logo = require('../assets/logo.png');

// 🔥 ELIMINAR la definición local y usar RootStackParamList
// type AuthStackParamList = { ... }
type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
    // ... (El resto de la lógica de estado y handleRequestReset es correcta) ...
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleRequestReset = async () => {
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        setEmailSent(false);

        try {
            await requestPasswordReset(email);
            setSuccessMessage('Si tu correo está registrado, recibirás instrucciones para resetear tu contraseña.');
            setEmail('');
            setEmailSent(true);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al solicitar el reseteo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLOR_PRIMARY_BLUE, COLOR_PRIMARY_GREEN]}
            style={styles.fullScreenBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* ... (Renderizado de Logo, BrandPanel y FormPanel sin cambios) ... */}

                <View style={styles.brandPanel}>
                    <Image source={logo} style={styles.loginLogo} />
                    <Text style={styles.brandTitle}>ECOWATT</Text>
                </View>

                <View style={styles.formPanel}>
                    <Text style={styles.formTitle}>Recuperar Contraseña</Text>
                    
                    {!emailSent && (
                        <Text style={styles.formSubtitle}>Ingresa tu correo electrónico registrado.</Text>
                    )}

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

                    {/* Input y Botón Enviar */}
                    {!emailSent && (
                        <>
                            <View style={styles.inputContainer}>
                                <Icon name="envelope" size={20} color="#888" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Correo Electrónico"
                                    placeholderTextColor="#888"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!isLoading}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.mainButton}
                                onPress={handleRequestReset}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? <ActivityIndicator size="small" color={COLOR_PRIMARY_BLUE} />
                                    : <Text style={styles.mainButtonText}>ENVIAR INSTRUCCIONES</Text>
                                }
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Botón Ingresar Token */}
                    {emailSent && (
                        <TouchableOpacity
                            style={[styles.mainButton, { backgroundColor: '#f39c12', marginTop: 10 }]}
                            onPress={() => navigation.navigate('ResetPassword')}
                        >
                            <Text style={[styles.mainButtonText, { color: '#FFF' }]}>INGRESAR TOKEN</Text>
                        </TouchableOpacity>
                    )}

                    {/* Botón Volver a Login */}
                    <TouchableOpacity
                        style={styles.secondaryLink}
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={styles.secondaryLinkText}>Volver a Iniciar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

export default ForgotPasswordScreen;