This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.


# EcoWatt Frontend - Documentación Técnica Completa

> **Versión:** 1.0.0  
> **Plataforma:** React Native (iOS & Android)  
> **Última actualización:** Diciembre 2025

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Arquitectura Frontend](#2-arquitectura-frontend)
3. [Instalación y Configuración](#3-instalación-y-configuración)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Navegación](#5-navegación)
6. [Gestión de Estado](#6-gestión-de-estado)
7. [Componentes Reutilizables](#7-componentes-reutilizables)
8. [Pantallas (Screens)](#8-pantallas-screens)
9. [Servicios](#9-servicios)
10. [Estilos y Diseño](#10-estilos-y-diseño)
11. [Integraciones](#11-integraciones)
12. [Optimizaciones y Performance](#12-optimizaciones-y-performance)
13. [Seguridad](#13-seguridad)
14. [Testing y Debugging](#14-testing-y-debugging)

---

## 1. Introducción

### 1.1 ¿Qué es EcoWatt?

**EcoWatt** es una aplicación móvil multiplataforma que permite a los usuarios mexicanos:

- 📊 **Monitorear** en tiempo real el consumo eléctrico de dispositivos inteligentes
- 🎛️ **Controlar** remotamente el encendido/apagado de aparatos
- 💰 **Visualizar** costos estimados según tarifas CFE
- 📈 **Analizar** patrones de consumo diario, semanal y mensual
- 📄 **Generar** reportes PDF descargables
- 🔔 **Recibir** notificaciones push sobre alertas de consumo

### 1.2 Stack Tecnológico Frontend

| Categoría | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| **Framework Core** | React Native | 0.82.1 | Base multiplataforma |
| **Lenguaje** | TypeScript | 5.8.3 | Tipado estático |
| **Navegación** | React Navigation | 7.x | Stack, Tabs, Drawers |
| **Estado Global** | Zustand | 5.0.8 | State management ligero |
| **Persistencia** | AsyncStorage | 2.2.0 | Cache local |
| **HTTP Client** | Fetch API | - | Llamadas REST |
| **WebSocket** | WebSocket API | - | Datos en tiempo real |
| **Gráficas** | react-native-gifted-charts | 1.4.68 | Visualización de datos |
| **Gráficas (legacy)** | react-native-chart-kit | 6.12.0 | Gráficas simples |
| **Notificaciones** | Firebase Cloud Messaging | 23.5.0 | Push notifications |
| **WiFi** | react-native-wifi-reborn | 4.13.6 | Escaneo de redes |
| **PDF** | react-native-print | 0.11.0 | Generación de reportes |
| **Iconos** | react-native-vector-icons | 10.3.0 | Iconografía |
| **Gradientes** | react-native-linear-gradient | 2.8.3 | Fondos animados |

### 1.3 Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN            │
│  (Screens: Login, Home, Stats, etc.)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       CAPA DE COMPONENTES               │
│  (CustomInput, SkeletonLoader, etc.)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         CAPA DE LÓGICA                  │
│  - Services (authService, etc.)         │
│  - Stores (useAuthStore, etc.)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      CAPA DE INTEGRACIÓN                │
│  - REST API (Fetch)                     │
│  - WebSocket                            │
│  - Firebase FCM                         │
│  - AsyncStorage                         │
└─────────────────────────────────────────┘
```

---

## 2. Arquitectura Frontend

### 2.1 Patrón de Diseño

**EcoWatt utiliza una arquitectura híbrida:**

```
Presentation Layer (UI)
    ↓
Business Logic (Services)
    ↓
State Management (Zustand)
    ↓
Data Layer (API + Cache)
```

**Flujo de Datos Unidireccional:**

```
Usuario interactúa con UI
    ↓
Componente llama a un Service
    ↓
Service consulta API
    ↓
Respuesta se guarda en Store
    ↓
UI se actualiza automáticamente (reactive)
```

### 2.2 Separación de Responsabilidades

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **Screens** | Renderizar UI y capturar eventos | `LoginScreen.tsx` |
| **Components** | Lógica de UI reutilizable | `CustomInput.tsx` |
| **Services** | Comunicación con backend | `authService.ts` |
| **Stores** | Estado global persistente | `useAuthStore.ts` |
| **Utils** | Funciones auxiliares | `permissions.ts` |
| **Styles** | Definiciones de diseño | `HomeStyles.ts` |

### 2.3 Flujo de Autenticación

```
┌─────────────────────────────────────────────────┐
│  1. Usuario ingresa credenciales               │
│     (LoginScreen)                               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. authService.loginUser()                     │
│     → POST /api/v1/auth/login                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Backend responde con:                       │
│     { access_token, refresh_token }             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. useAuthStore.login()                        │
│     → Guarda tokens en memoria + AsyncStorage   │
│     → Cambia isAuthenticated = true             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. initializeNotificationService()             │
│     → Registra FCM token en backend             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  6. AppNavigator detecta cambio de estado       │
│     → Muestra MainApp (pantallas autenticadas)  │
└─────────────────────────────────────────────────┘
```

### 2.4 Flujo de Refresh Token (Auto-renovación)

```javascript
// authService.ts - Función clave

async function fetchWithRefresh(endpoint, options) {
  // 1. Intento inicial
  let response = await fetch(endpoint, options);

  // 2. Si el servidor responde 401 (token expirado)
  if (response.status === 401 && store.refreshToken) {
    
    // 3. Renovar tokens automáticamente
    const newTokens = await refreshAccessToken(store.refreshToken);
    
    // 4. Actualizar en el store
    store.login(newTokens.access_token, newTokens.refresh_token);
    
    // 5. Reintentar la llamada original con nuevo token
    const newHeaders = {
      ...options.headers,
      'Authorization': `Bearer ${newTokens.access_token}`
    };
    response = await fetch(endpoint, { ...options, headers: newHeaders });
  }

  return response;
}
```

**Ventaja:** El usuario nunca se da cuenta de que su token expiró. La renovación es transparente.

---

## 3. Instalación y Configuración

### 3.1 Requisitos Previos

```bash
# Verificar versiones
node -v    # >= 20.0.0
npm -v     # >= 9.0.0
```

**Para iOS:**
```bash
xcode-select --install
sudo gem install cocoapods
```

**Para Android:**
- Android Studio con SDK 33
- Java JDK 11

### 3.2 Instalación Paso a Paso

```bash
# 1. Clonar repositorio
git clone [URL_DEL_REPOSITORIO]
cd EcowattNuevo

# 2. Instalar dependencias
npm install

# 3. iOS: Instalar pods
cd ios
pod install
cd ..

# 4. Configurar Firebase (ver siguiente sección)
```

### 3.3 Configuración de Firebase

#### 3.3.1 Android

1. **Crear proyecto en Firebase Console**
   - Ir a https://console.firebase.google.com
   - Crear nuevo proyecto
   - Añadir app Android

2. **Descargar `google-services.json`**
   - Package name: `com.ecowattnuevo` (debe coincidir con `android/app/build.gradle`)
   - Colocar archivo en: `android/app/google-services.json`

3. **Verificar configuración en `android/app/build.gradle`:**

```gradle
apply plugin: "com.android.application"
apply plugin: "com.google.gms.google-services" // ← Importante

android {
    compileSdkVersion 33
    defaultConfig {
        minSdkVersion 23
        targetSdkVersion 33
    }
}

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

4. **Activar Cloud Messaging en Firebase Console**
   - Ir a Project Settings → Cloud Messaging
   - Habilitar API

#### 3.3.2 iOS

1. **Descargar `GoogleService-Info.plist`**
   - Añadir app iOS en Firebase Console
   - Bundle ID: `org.reactjs.native.example.EcowattNuevo`
   - Colocar en: `ios/EcowattNuevo/GoogleService-Info.plist`

2. **Configurar `ios/Podfile`:**

```ruby
platform :ios, '12.0'
use_frameworks! :linkage => :static

target 'EcowattNuevo' do
  # ...
  pod 'Firebase/Messaging'
end
```

3. **Ejecutar:**

```bash
cd ios
pod install
cd ..
```

4. **Habilitar capabilities en Xcode:**
   - Abrir `ios/EcowattNuevo.xcworkspace`
   - Signing & Capabilities → + Capability
   - Añadir: **Push Notifications**
   - Añadir: **Background Modes** → Remote notifications

### 3.4 Variables de Configuración

**Archivo: `src/services/authService.ts`**

```typescript
const API_BASE_URL = 'https://core-cloud.dev';
```

**Archivo: `src/screens/AddDeviceScreen.tsx`**

```typescript
const MQTT_CONFIG = {
    server: '134.209.61.74:1883',
    user: 'ecowatt_shelly',
    pass: 'SjTqQh4htnRK7rqN8tsOmSgFY'
};

const INGESTION_URL = 'https://core-cloud.dev/api/v1/ingest/shelly';
```

**⚠️ Nota de Seguridad:** En producción, estas credenciales deberían estar en variables de entorno o en un servicio de secrets management.

### 3.5 Ejecutar la App

**iOS:**
```bash
npm run ios
# o específico
npm run ios -- --simulator="iPhone 14 Pro"
```

**Android:**
```bash
npm run android
# o con dispositivo específico
adb devices
npm run android -- --deviceId=DEVICE_ID
```

**Metro Bundler (servidor de desarrollo):**
```bash
npm start
```

---

## 4. Estructura del Proyecto

### 4.1 Árbol de Archivos Detallado

```
EcowattNuevo/
│
├── index.js                          # Entry point principal
│
├── src/
│   │
│   ├── App.tsx                       # Componente raíz
│   │   └── Inicializa Firebase
│   │   └── Configura NavigationContainer
│   │
│   ├── @types/                       # Definiciones TypeScript
│   │   └── react-native-zeroconf.d.ts
│   │
│   ├── assets/                       # Recursos estáticos
│   │   ├── logo.png                  # Logo de EcoWatt
│   │   └── fondo.jpg                 # Imagen de fondo
│   │
│   ├── components/                   # Componentes reutilizables
│   │   ├── CustomInput.tsx           # Input con animación de focus
│   │   └── SkeletonLoader.tsx        # Placeholder animado
│   │
│   ├── navigation/                   # Configuración de rutas
│   │   └── AppNavigator.tsx          # Stack + Tabs
│   │
│   ├── screens/                      # Pantallas de la app
│   │   ├── LoginScreen.tsx           # Inicio de sesión
│   │   ├── RegisterScreen.tsx        # Registro de usuario
│   │   ├── ForgotPasswordScreen.tsx  # Recuperar contraseña
│   │   ├── ResetPasswordScreen.tsx   # Resetear contraseña
│   │   ├── HomeScreen.tsx            # Dashboard principal
│   │   ├── ProfileScreen.tsx         # Perfil + dispositivos
│   │   ├── StatsScreen.tsx           # Gráficas y análisis
│   │   ├── AddDeviceScreen.tsx       # Configurar Shelly
│   │   ├── EditProfileScreen.tsx     # Editar datos personales
│   │   └── NotificationsScreen.tsx   # Centro de notificaciones
│   │
│   ├── services/                     # Lógica de negocio
│   │   ├── authService.ts            # API de autenticación
│   │   ├── notificationService.ts    # FCM setup
│   │   ├── reportService.ts          # API de reportes
│   │   └── PDFGenerator.tsx          # Crear PDFs
│   │
│   ├── store/                        # Estado global (Zustand)
│   │   ├── useAuthStore.ts           # Sesión del usuario
│   │   └── useNotificationStore.ts   # Historial de notificaciones
│   │
│   ├── styles/                       # Estilos por pantalla
│   │   ├── loginStyles.ts
│   │   ├── HomeStyles.ts
│   │   ├── StatsStyles.ts
│   │   └── ...
│   │
│   └── utils/                        # Utilidades
│       └── permissions.ts            # Gestión de permisos
│
├── android/                          # Proyecto Android nativo
│   ├── app/
│   │   ├── build.gradle              # Config de build
│   │   ├── google-services.json      # Firebase Android
│   │   └── src/main/AndroidManifest.xml
│   └── build.gradle                  # Config global
│
├── ios/                              # Proyecto iOS nativo
│   ├── EcowattNuevo/
│   │   ├── Info.plist                # Permisos y config
│   │   └── GoogleService-Info.plist  # Firebase iOS
│   ├── Podfile                       # Dependencias CocoaPods
│   └── EcowattNuevo.xcworkspace      # Proyecto Xcode
│
├── package.json                      # Dependencias npm
├── tsconfig.json                     # Config TypeScript
├── babel.config.js                   # Config Babel
└── metro.config.js                   # Config Metro bundler
```

### 4.2 Convenciones de Código

#### 4.2.1 Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `CustomInput`, `HomeScreen` |
| Archivos de componentes | PascalCase.tsx | `LoginScreen.tsx` |
| Funciones | camelCase | `loginUser`, `getDevices` |
| Variables | camelCase | `accessToken`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL`, `PRIMARY_GREEN` |
| Interfaces | PascalCase | `UserProfile`, `Device` |
| Types | PascalCase | `RootStackParamList` |
| Stores | camelCase con `use` | `useAuthStore` |
| Services | camelCase + Service | `authService.ts` |

#### 4.2.2 Estructura de Archivos

**Pantalla típica:**

```typescript
// 1. Imports externos
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Imports de navegación
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// 3. Imports de servicios
import { getUserProfile } from '../services/authService';

// 4. Imports de stores
import { useAuthStore } from '../store/useAuthStore';

// 5. Imports de estilos
import styles from '../styles/HomeStyles';

// 6. Types
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

// 7. Componente principal
const HomeScreen = ({ navigation }: HomeScreenProps) => {
  // Estados locales
  const [data, setData] = useState(null);
  
  // Stores globales
  const { token } = useAuthStore();
  
  // Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // Funciones
  const loadData = async () => {
    // ...
  };
  
  // Render
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
};

// 8. Export
export default HomeScreen;
```

---

## 5. Navegación

### 5.1 Estructura de Navegadores

**AppNavigator.tsx - Organización:**

```
Stack Navigator (Root)
├── [No autenticado]
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ResetPassword
│
└── [Autenticado]
    ├── MainApp (Tab Navigator)
    │   ├── Home
    │   ├── Stats
    │   └── Profile
    │
    ├── AddDevice (Stack Screen)
    ├── EditProfile (Stack Screen)
    └── Notifications (Stack Screen - Modal)
```

### 5.2 Tipos de Navegación

**Archivo: `src/navigation/AppNavigator.tsx`**

```typescript
// Definición de rutas del Stack principal
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  MainApp: undefined;
  AddDevice: undefined;
  EditProfile: { currentUser: UserProfile };
  Notifications: undefined;
};

// Definición de rutas de los Tabs
export type RootTabParamList = {
  Home: undefined;
  Profile: undefined;
  Stats: undefined;
};
```

### 5.3 Navegación Condicional (Autenticación)

```typescript
const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Usuario logueado
        <>
          <Stack.Screen name="MainApp" component={MainAppTabs} />
          <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        // Usuario sin sesión
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
```

**Explicación:** 
- Zustand detecta cambio en `isAuthenticated`
- React Navigation re-renderiza automáticamente
- Las pantallas de login desaparecen de la memoria (optimización)

### 5.4 Tab Navigator (Barra Inferior)

```typescript
function MainAppTabs() {
  const { hasDevices } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Solo iconos
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 20,
          right: 20,
          backgroundColor: 'rgba(40, 40, 40, 0.9)',
          borderRadius: 30,
          height: 70,
          elevation: 8,
          shadowColor: '#00FF7F',
          shadowOpacity: 0.4,
        },
        tabBarIcon: ({ focused }) => {
          let iconName = '';
          
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Stats': iconName = focused ? 'bar-chart' : 'bar-chart-outline'; break;
            case 'Profile': iconName = focused ? 'person-circle' : 'person-circle-outline'; break;
          }

          return (
            <Ionicons 
              name={iconName} 
              size={focused ? 32 : 26} 
              color={focused ? '#00FF7F' : '#a0a0a0'} 
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      
      {/* Stats solo accesible si hay dispositivos */}
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        listeners={{
          tabPress: (e) => {
            if (!hasDevices) {
              e.preventDefault();
              Alert.alert(
                "Sin Dispositivos",
                "Añade tu primer dispositivo para ver el análisis."
              );
            }
          },
        }}
      />
      
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

**Características:**
- Barra flotante con glassmorphism
- Iconos con animación de tamaño
- Sombra verde neón en activo
- Bloqueo de Stats si no hay dispositivos

### 5.5 Navegación Programática

**Ejemplo: Ir a pantalla de notificaciones desde Home:**

```typescript
// En HomeScreen.tsx
import { CompositeScreenProps } from '@react-navigation/native';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Notifications')}
    >
      <Icon name="bell" size={24} color="#FFF" />
    </TouchableOpacity>
  );
};
```

**Ejemplo: Navegar con parámetros:**

```typescript
// Desde ProfileScreen
navigation.navigate('EditProfile', { 
  currentUser: profile 
});

// En EditProfileScreen
const EditProfileScreen = ({ route }) => {
  const { currentUser } = route.params;
  // ...
};
```

---

## 6. Gestión de Estado

### 6.1 Zustand - Store de Autenticación

**Archivo: `src/store/useAuthStore.ts`**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  // Estado
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  wifiSsid: string | null;
  wifiPassword: string | null;
  hasDevices: boolean;

  // Acciones
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  setWifiCredentials: (ssid: string, password: string) => void;
  setHasDevices: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      wifiSsid: null,
      wifiPassword: null,
      hasDevices: false,

      // Implementación de acciones
      login: (accessToken, refreshToken) => {
        set({
          isAuthenticated: true,
          token: accessToken,
          refreshToken,
        });
        
        // Inicializar notificaciones
        initializeNotificationService(accessToken);
      },

      logout: async () => {
        const refreshToken = get().refreshToken;
        
        // Llamar API de logout
        if (refreshToken) {
          await logoutUser(refreshToken);
        }
        
        // Limpiar estado
        set({
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          wifiSsid: null,
          wifiPassword: null,
          hasDevices: false,
        });
      },

      setWifiCredentials: (ssid, password) => {
        set({ wifiSsid: ssid, wifiPassword: password });
      },

      setHasDevices: (status) => {
        set({ hasDevices: status });
      },
    }),
    {
      name: 'auth-storage', // Nombre en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      
      // Callback cuando se restaura el estado desde AsyncStorage
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state?.token) {
          console.log('Sesión restaurada, inicializando notificaciones...');
          initializeNotificationService(state.token);
        }
      },
    }
  )
);
```

**Uso en componentes:**

```typescript
// Leer estado
const { token, isAuthenticated, hasDevices } = useAuthStore();

// Ejecutar acción
const { login, logout } = useAuthStore();
login('nuevo_token', 'refresh_token');

// Fuera de componentes (funciones puras)
const token = useAuthStore.getState().token;
useAuthStore.getState().logout();
```

### 6.2 Zustand - Store de Notificaciones

**Archivo: `src/store/useNotificationStore.ts`**

```typescript
interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string; // ISO 8601
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  
  addNotification: (notification: { title: string; body: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        set((state) => {
          const newNotification: NotificationItem = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            title: notification.title,
            body: notification.body,
            date: new Date().toISOString(),
            read: false,
          };
          
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        });
      },
      
      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (!notification || notification.read) return state;

          const newNotifications = state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          );
          
          return {
            notifications: newNotifications,
            unreadCount: state.unreadCount - 1,
          };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Uso típico:**

```typescript
// En NotificationsScreen
const { notifications, unreadCount, markAsRead } = useNotificationStore();

// En HomeScreen (badge)
const unreadCount = useNotificationStore(state => state.unreadCount);

// En notificationService (agregar nueva)
useNotificationStore.getState().addNotification({
  title: 'Alerta de Consumo
