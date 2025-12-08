import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import LinearGradient from 'react-native-linear-gradient'; 

import { registerUser } from '../services/authService'; 
import registerStyles from '../styles/RegisterStyles';
import { COLOR_PRIMARY_GREEN } from '../styles/loginStyles';

// 🔥 AÑADIDO: Importamos el componente visual mejorado
import CustomInput from '../components/CustomInput';

import { RootStackParamList } from '../navigation/AppNavigator'; 

const logo = require('../assets/logo.png');

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cutDay, setCutDay] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !cutDay) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        const dayNumber = parseInt(cutDay, 10);
        if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
            setError('El día de corte debe ser un número entre 1 y 31.');
            return; 
        }

        setIsLoading(true);
        setError('');

        try {
           await registerUser({
                user_name: name,
                user_email: email,
                user_password: password,
                user_trf_rate: '1f', 
                user_billing_day: dayNumber, 
           });
           
           Alert.alert(
                '¡Registro Exitoso!',
                'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }] 
           );

        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#003366', '#66CC66']} 
            style={registerStyles.fullScreenBackground} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
        >
            <ScrollView 
                contentContainerStyle={registerStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={registerStyles.brandPanel}> 
                    <Image source={logo} style={registerStyles.loginLogo} />
                    <Text style={registerStyles.brandTitle}>ECOWATT</Text>
                    <Text style={registerStyles.brandSlogan}>Crea tu cuenta de ahorro.</Text>
                </View>

                <View style={registerStyles.formPanel}>
                    <Text style={registerStyles.formTitle}>Registro de Usuario</Text>
                    
                    {error ? <Text style={registerStyles.errorText}>{error}</Text> : null}

                    {/* Campo: Nombre Completo (MEJORADO) */}
                    <View style={registerStyles.inputContainer}>
                        <Icon name="user-plus" size={20} color="#888" style={registerStyles.inputIcon} />
                        <CustomInput 
                            style={registerStyles.input} 
                            placeholder="Nombre Completo" 
                            placeholderTextColor="#888" 
                            onChangeText={setName} 
                            value={name} 
                        />
                    </View>
                    
                    {/* Campo: Email (MEJORADO) */}
                    <View style={registerStyles.inputContainer}>
                        <Icon name="envelope" size={20} color="#888" style={registerStyles.inputIcon} />
                        <CustomInput 
                            style={registerStyles.input} 
                            placeholder="Correo Electrónico" 
                            placeholderTextColor="#888" 
                            keyboardType="email-address" 
                            autoCapitalize="none" 
                            onChangeText={setEmail} 
                            value={email}
                        />
                    </View>
                    
                    {/* Campo: Contraseña (MEJORADO CON OJO FLOTANTE) */}
                    <View style={registerStyles.inputContainer}>
                        <Icon name="lock" size={20} color="#888" style={registerStyles.inputIcon} />
                        
                        <CustomInput
                          style={[
                            registerStyles.input, 
                            { color: '#000', fontFamily: undefined, paddingRight: 40 }, // Espacio para el ojo
                          ]}
                          placeholder="Contraseña"
                          placeholderTextColor="#888"
                          secureTextEntry={!isPasswordVisible}
                          onChangeText={setPassword}
                          value={password}
                        />

                        <TouchableOpacity 
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            style={{ position: 'absolute', right: 15 }} // Posición fija a la derecha
                        >
                            <Icon 
                                name={isPasswordVisible ? 'eye-slash' : 'eye'} 
                                size={20} 
                                color={COLOR_PRIMARY_GREEN} 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Campo: Día de Corte (MEJORADO) */}
                    <View style={registerStyles.inputContainer}>
                        <Icon name="calendar" size={20} color="#888" style={registerStyles.inputIcon} />
                        <CustomInput 
                            style={registerStyles.input} 
                            placeholder="Día de Corte (1-31)" 
                            placeholderTextColor="#888" 
                            keyboardType="numeric" 
                            maxLength={2} 
                            onChangeText={setCutDay} 
                            value={cutDay} 
                        />
                    </View>

                    {/* Botón: Crear Cuenta */}
                    <TouchableOpacity style={registerStyles.loginButton} onPress={handleRegister} disabled={isLoading}>
                        {isLoading ? ( <ActivityIndicator size="small" color="#FFFFFF" /> ) : ( <Text style={registerStyles.loginButtonText}>CREAR CUENTA</Text> )}
                    </TouchableOpacity>
                    
                    {/* Botón: Iniciar Sesión */}
                    <TouchableOpacity style={{ marginTop: 15 }} onPress={() => navigation.navigate('Login')}>
                        <Text style={registerStyles.forgotPasswordText}>Ya tengo cuenta, Iniciar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

export default RegisterScreen;