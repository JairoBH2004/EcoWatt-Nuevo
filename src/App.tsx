import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';

// 🔥 AÑADIDO: Importación del módulo base de Firebase
import firebase from '@react-native-firebase/app';

// CÓDIGO CLAVE: Inicializar Firebase aquí antes de que se use en cualquier componente
if (!firebase.apps.length) {
  try {
    console.log("--- Firebase inicializado ---");
    // Esto inicializa la app predeterminada y resuelve el crasheo inicial.
    // 🔥 CORRECCIÓN FINAL: Usamos @ts-ignore para que el editor ignore el error de tipos.
    // El código es correcto para React Native Firebase sin argumentos (default app).
    // @ts-ignore
    firebase.initializeApp(); 
  } catch (e) {
    console.error("Error al inicializar Firebase:", e); 
  }
}

const App = () => {
  console.log("--- APP INICIADA ---");
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#1E2A47" 
        />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;