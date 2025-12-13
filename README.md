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
  title: 'Alerta de Consumo',
  body: 'Tu consumo superó el 80% del límite'
});
```

### 6.3 Ventajas de Zustand vs Redux

| Característica | Zustand | Redux |
|----------------|---------|-------|
| Boilerplate | Mínimo | Alto |
| Curva de aprendizaje | Baja | Alta |
| TypeScript | Nativo | Requiere configuración |
| Tamaño del bundle | ~1KB | ~12KB |
| Persistencia | Middleware simple | redux-persist complejo |
| Acceso fuera de React | `getState()` directo | Requiere store import |

---

## 7. Componentes Reutilizables

### 7.1 CustomInput

**Archivo: `src/components/CustomInput.tsx`**

**Propósito:** Input mejorado con animación de focus y estilos consistentes.

**Código completo:**

```typescript
import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, StyleProp, TextStyle } from 'react-native';

interface CustomInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

const CustomInput = ({ style, ...props }: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      {...props}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus && props.onFocus(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur && props.onBlur(e);
      }}
      style={[
        styles.input,
        style,
        isFocused && styles.inputFocused
      ]}
      placeholderTextColor="#888"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 15,
  },
  inputFocused: {
    borderColor: '#00FF7F', // Verde brillante
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
});

export default CustomInput;
```

**Características:**
- ✅ Hereda todos los props de `TextInput` nativo
- ✅ Animación suave de borde al hacer focus
- ✅ Compatible con estilos externos
- ✅ Color de placeholder consistente

**Uso en pantallas:**

```typescript
<CustomInput
  style={{ marginTop: 20 }} // Estilos adicionales
  placeholder="Correo Electrónico"
  keyboardType="email-address"
  autoCapitalize="none"
  value={email}
  onChangeText={setEmail}
/>
```

### 7.2 SkeletonLoader

**Archivo: `src/components/SkeletonLoader.tsx`**

**Propósito:** Placeholder animado durante carga de datos.

**Código completo:**

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, StyleSheet } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  borderRadius?: number;
}

const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  style, 
  borderRadius = 8 
}: SkeletonLoaderProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { 
          toValue: 0.7, 
          duration: 800, 
          useNativeDriver: true 
        }),
        Animated.timing(opacity, { 
          toValue: 0.3, 
          duration: 800, 
          useNativeDriver: true 
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { opacity, width, height, borderRadius } as any,
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
});

export default SkeletonLoader;
```

**Uso típico:**

```typescript
// Durante carga de HomeScreen
{isLoading && (
  <>
    <SkeletonLoader width="100%" height={120} borderRadius={16} style={{ marginBottom: 20 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <SkeletonLoader width={(screenWidth / 2) - 30} height={100} borderRadius={16} />
      <SkeletonLoader width={(screenWidth / 2) - 30} height={100} borderRadius={16} />
    </View>
  </>
)}
```

**Resultado visual:**
```
┌────────────────────────────┐
│ ███████░░░░░░░░░░░░░██████ │ ← Animación de pulso
└────────────────────────────┘
```

---

## 8. Pantallas (Screens)

### 8.1 LoginScreen

**Archivo: `src/screens/LoginScreen.tsx`**

**Flujo de usuario:**

```
1. Usuario ingresa email + contraseña
2. Presiona botón "INGRESAR"
3. Validación local (campos no vacíos)
4. Llamada a authService.loginUser()
5. Si éxito:
   ├─ Guardar tokens en useAuthStore
   ├─ Inicializar notificaciones FCM
   └─ Navegar automáticamente a MainApp
6. Si error:
   └─ Mostrar mensaje de error
```

**Componentes principales:**

```typescript
const LoginScreen = ({ navigation }) => {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, completa ambos campos.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const data = await loginUser({
        user_email: email,
        user_password: password
      });

      // Guardar tokens
      login(data.access_token, data.refresh_token);

      // Inicializar notificaciones
      initializeNotificationService(data.access_token);

    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#003366', '#66CC66']}>
      {/* Logo */}
      <Image source={logo} style={styles.loginLogo} />
      
      {/* Formulario */}
      <View style={styles.formPanel}>
        <Text style={styles.formTitle}>Bienvenido de nuevo</Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {/* Email */}
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#888" />
          <CustomInput 
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        {/* Password con toggle de visibilidad */}
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" />
          <CustomInput
            placeholder="Contraseña"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Icon name={isPasswordVisible ? "eye-slash" : "eye"} size={20} color="#00FF7F" />
          </TouchableOpacity>
        </View>
        
        {/* Botones */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>INGRESAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};
```

**Características especiales:**
- Gradiente azul → verde
- Input con icono de ojo para mostrar/ocultar contraseña
- Manejo de errores inline
- Loading state con ActivityIndicator

### 8.2 HomeScreen

**Archivo: `src/screens/HomeScreen.tsx`**

**Propósito:** Dashboard principal con resumen de consumo.

**Datos mostrados:**

```typescript
interface DashboardData {
  // Tarjeta principal
  estimated_cost_mxn: number;
  days_in_cycle: number;
  
  // Tarjetas pequeñas
  kwh_consumed_cycle: number;
  carbon_footprint: {
    co2_emitted_kg: number;
    equivalent_trees_absorption_per_year: number;
  };
  
  // Recomendación
  latest_recommendation: string;
  
  // Gráfica
  last7days: { timestamp: string, value: number }[];
}
```

**Estructura visual:**

```
┌─────────────────────────────┐
│ ¡Hola, Juan!         🔔(3)  │
├─────────────────────────────┤
│  Costo Estimado del Periodo │
│      $1,234.56 MXN          │
│   Días en el ciclo: 15      │
├─────────────────────────────┤
│ [125.4 kWh]  [12.3 kg CO₂]  │
│  Consumo      Emisiones     │
├─────────────────────────────┤
│ 💡 Reduce consumo en horas  │
│    pico (6pm-10pm)          │
├─────────────────────────────┤
│   Consumo Últimos 7 Días    │
│  📊 [Gráfica de barras]     │
└─────────────────────────────┘
```

**Lógica de carga:**

```typescript
const HomeScreen = ({ navigation }) => {
  const { token, logout, setHasDevices } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Contador de notificaciones no leídas
  const unreadCount = useNotificationStore(state => state.unreadCount);

  useEffect(() => {
    loadInitialData();
  }, [token]);

  const loadInitialData = async () => {
    if (!token) {
      logout();
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Cargar perfil
      const profileData = await getUserProfile(token);
      setProfile(profileData);

      // 2. Cargar dispositivos
      let devicesData: Device[] = [];
      try {
        devicesData = await getDevices(token);
        setDevices(devicesData);
      } catch (err: any) {
        if (err.message.includes('404')) {
          setDevices([]);
        }
      }

      // 3. Si hay dispositivos, cargar datos
      if (devicesData.length > 0) {
        setHasDevices(true);

        const [summaryData, historyData] = await Promise.all([
          getDashboardSummary(token),
          getLast7DaysHistory(token)
        ]);
        
        setSummary(summaryData);
        
        // Procesar datos de gráfica
        if (historyData?.data_points) {
          const labels = historyData.data_points.map(p => {
            const date = new Date(p.timestamp);
            return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];
          });
          
          const values = historyData.data_points.map(p => p.value);
          
          setGraphData({
            labels,
            datasets: [{ data: values }]
          });
        }
      } else {
        setHasDevices(false);
      }

    } catch (err: any) {
      if (err.message.includes('401')) {
        logout();
      }
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  // Skeleton loader durante carga
  if (isLoading) {
    return (
      <View>
        <SkeletonLoader width="100%" height={120} />
        <SkeletonLoader width="48%" height={100} />
        {/* ... más skeletons */}
      </View>
    );
  }

  // Si no hay dispositivos
  if (devices.length === 0) {
    return (
      <View style={styles.centeredContent}>
        <Icon name="plus-circle" size={50} color="#00FF7F" />
        <Text>¡Bienvenido a EcoWatt!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddDevice')}>
          <Text>Añadir Dispositivo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Dashboard con datos
  return (
    <ScrollView>
      {/* Header con badge de notificaciones */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>¡Hola, {profile?.user_name}!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="bell" size={24} color="#FFF" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tarjeta principal */}
      <View style={styles.mainCard}>
        <Text>Costo Estimado del Periodo</Text>
        <Text style={styles.projectedCost}>
          ${summary?.estimated_cost_mxn?.toFixed(2) || '0.00'} MXN
        </Text>
      </View>

      {/* Tarjetas de consumo y CO2 */}
      <View style={styles.smallCardsContainer}>
        <View style={styles.smallCard}>
          <Icon name="bolt" size={24} color="#00FF7F" />
          <Text>{summary?.kwh_consumed_cycle?.toFixed(2)} kWh</Text>
          <Text>Consumo del Ciclo</Text>
        </View>
        
        {/* Tarjeta de CO2 con toggle */}
        <TouchableOpacity 
          style={styles.smallCard}
          onPress={() => setShowTrees(!showTrees)}
        >
          <Icon name={showTrees ? "tree" : "leaf"} size={24} color="#00FF7F" />
          <Text>
            {showTrees 
              ? summary?.carbon_footprint?.equivalent_trees_absorption_per_year?.toFixed(1)
              : summary?.carbon_footprint?.co2_emitted_kg?.toFixed(1)
            }
          </Text>
          <Text>{showTrees ? "Árboles Eq." : "CO₂ Emitido"}</Text>
        </TouchableOpacity>
      </View>

      {/* Recomendación */}
      <View style={styles.recommendationCard}>
        <Icon name="lightbulb" size={24} color="#003366" />
        <Text>{summary?.latest_recommendation}</Text>
      </View>

      {/* Gráfica */}
      <View style={styles.graphContainer}>
        <Text>Consumo Últimos 7 Días</Text>
        <BarChart
          data={graphData}
          width={screenWidth - 60}
          height={220}
          chartConfig={{
            backgroundColor: '#1E2A47',
            color: (opacity = 1) => `rgba(0, 255, 127, ${opacity})`,
          }}
        />
      </View>
    </ScrollView>
  );
};
```

**Optimizaciones:**
- Promise.all para cargar datos en paralelo
- Skeleton loaders para mejor UX
- Badge reactivo de notificaciones
- Toggle CO2 ↔ Árboles (tap en tarjeta)

### 8.3 StatsScreen

**Archivo: `src/screens/StatsScreen.tsx`**

**Propósito:** Análisis detallado con gráficas y datos en tiempo real.

**Secciones:**

```
┌─────────────────────────────┐
│    CONSUMO EN TIEMPO REAL   │
│   ⚡ 1,234 WATTS (EN VIVO)  │
│   [Gráfica de línea]        │
├─────────────────────────────┤
│    HISTORIAL DIARIO         │
│   [Selector de fecha]       │
│   [Gráfica de barras]       │
├─────────────────────────────┤
│    HISTORIAL SEMANAL        │
│   [Selector de fecha]       │
│   [Gráfica de barras]       │
├─────────────────────────────┤
│    REPORTES MENSUALES       │
│   [Selector de mes]         │
│   [Botón: Generar PDF]      │
│   [Gráfica de barras]       │
└─────────────────────────────┘
```

**WebSocket para datos en vivo:**

```typescript
const StatsScreen = () => {
  const { token } = useAuthStore();
  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [realtimeData, setRealtimeData] = useState<ChartDataItem[]>([]);
  const [currentWatts, setCurrentWatts] = useState<number | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const MAX_REALTIME_POINTS = 30;

  // Cargar ID del primer dispositivo
  useEffect(() => {
    const loadDevice = async () => {
      const devices = await getDevices(token);
      if (devices.length > 0) {
        setDeviceId(devices[0].dev_id);
      }
    };
    loadDevice();
  }, [token]);

  // Conectar WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      if (!token || !deviceId) return;
      if (ws.current?.readyState === WebSocket.OPEN) return;

      setWsStatus('connecting');
      
      const socket = new WebSocket(
        `wss://core-cloud.dev/ws/live/${deviceId}?token=${token}`
      );

      socket.onopen = () => {
        console.log('✅ WebSocket conectado');
        setWsStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Backend puede enviar: watts, apower, power o value
          const watts = message.watts ?? message.apower ?? message.power ?? message.value;
          
          if (typeof watts === 'number') {
            setCurrentWatts(watts);
            
            // Agregar punto a la gráfica
            setRealtimeData(prev => {
              const newData = [
                ...prev, 
                { value: watts, label: '', frontColor: '#FF4500' }
              ];
              
              // Mantener solo últimos 30 puntos
              return newData.length > MAX_REALTIME_POINTS 
                ? newData.slice(newData.length - MAX_REALTIME_POINTS)
                : newData;
            });
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setWsStatus('disconnected');
      };

      socket.onclose = (e) => {
        console.log('🔌 WebSocket cerrado. Código:', e.code);
        ws.current = null;
        setWsStatus('disconnected');
        
        // Reintentar conexión (máximo 3 veces)
        if (e.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          const delay = 1000 * reconnectAttemptsRef.current;
          
          console.log(`⏳ Reintentando en ${delay}ms (intento ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          // Reset gráfica si falló definitivamente
          setRealtimeData([{ value: 0, label: '', frontColor: '#FF4500' }]);
        }
      };

      ws.current = socket;
    };

    const disconnect = () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    disconnect();
    if (deviceId) {
      connectWebSocket();
    }

    return () => disconnect();
  }, [token, deviceId]);

  return (
    <ScrollView>
      {/* Badge EN VIVO pulsante */}
      <View style={styles.liveSection}>
        <LivePulseBadge status={wsStatus} />
        
        <View style={styles.wattsContainer}>
          {wsStatus === 'connecting' ? (
            <ActivityIndicator size="large" color="#00FF7F" />
          ) : (
            <>
              <Text style={styles.wattsNumber}>
                {currentWatts !== null ? currentWatts.toFixed(0) : '---'}
              </Text>
              <Text style={styles.wattsUnit}>WATTS</Text>
            </>
          )}
        </View>

        {/* Gráfica en tiempo real */}
        <LineChart
          areaChart
          curved
          data={realtimeData}
          height={120}
          width={screenWidth - 60}
          color="#FF4500"
          startFillColor="#FF4500"
          endFillColor="#FF4500"
          startOpacity={0.4}
          endOpacity={0.0}
          hideRules
          hideYAxisText
          hideDataPoints
          hideAxesAndRules
        />
      </View>

      {/* Resto de gráficas históricas */}
      {/* ... */}
    </ScrollView>
  );
};
```

**Componente LivePulseBadge:**

```typescript
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

  const getConfig = () => {
    if (status === 'connected') return { color: '#FF4500', text: 'EN VIVO', icon: 'circle' };
    if (status === 'connecting') return { color: '#FFA500', text: 'CONECTANDO', icon: 'sync' };
    return { color: '#666', text: 'OFFLINE', icon: 'times-circle' };
  };

  const config = getConfig();

  return (
    <View style={styles.badge}>
      <Animated.View style={{ 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: config.color,
        opacity: status === 'connected' ? opacity : 1,
      }} />
      <Text style={{ color: config.color }}>{config.text}</Text>
    </View>
  );
};
```

**Generación de reporte PDF:**

```typescript
const handleGenerateReport = async () => {
  if (!token) return;
  
  // Solicitar permisos de almacenamiento
  if (!(await requestStoragePermission())) return;
  
  setIsGeneratingReport(true);
  
  try {
    // Determinar si es mes actual o histórico
    const isCurrent = selectedMonthlyDate.getMonth() === new Date().getMonth();
    
    const reportData = isCurrent 
      ? await getCurrentMonthlyReport(token)
      : await getMonthlyReport(token, selectedMonthlyDate.getMonth() + 1, selectedMonthlyDate.getFullYear());
    
    // Generar PDF
    const result = await generateEcoWattReport(reportData);
    
    Alert.alert(
      result.success ? "¡Listo!" : "Error",
      result.success ? "PDF generado correctamente." : "No se pudo crear el PDF."
    );
  } catch (e) {
    Alert.alert("Aviso", "Sin datos suficientes para generar reporte.");
  } finally {
    setIsGeneratingReport(false);
  }
};
```

### 8.4 AddDeviceScreen

**Archivo: `src/screens/AddDeviceScreen.tsx`**

**Propósito:** Configurar y registrar dispositivos Shelly.

**Proceso completo (6 fases):**

```
FASE 1: Configuración WiFi
─────────────────────────
├─ Verificar credenciales guardadas
├─ Si no existen → Mostrar modal
└─ Guardar SSID + Password en useAuthStore

FASE 2: Escaneo de Redes
─────────────────────────
├─ Solicitar permisos (ubicación + WiFi)
├─ WifiManager.loadWifiList()
├─ Filtrar redes "shelly*"
└─ Mostrar lista al usuario

FASE 3: Conexión al Shelly
─────────────────────────
├─ WifiManager.connectToProtectedSSID(ssid, '', false, false)
├─ Polling de verificación (10 intentos)
├─ getCurrentWifiSSID() == targetSSID
└─ Timeout si falla

FASE 4: Configuración RPC
─────────────────────────
├─ A) Identificar dispositivo
│  ├─ POST /rpc/Sys.GetStatus → Extraer MAC
│  └─ GET /rpc/Shelly.GetDeviceInfo → Backup
│
├─ B) Configurar MQTT
│  └─ POST /rpc/Mqtt.SetConfig
│     {
│       enable: true,
│       server: "134.209.61.74:1883",
│       client_id: "shellyplus1pm-aabbccdd" (minúsculas),
│       topic_prefix: "shellyplus1pm-aabbccdd",
│       rpc_ntf: true,
│       status_ntf: true
│     }
│
├─ C) Instalar Script de Monitoreo
│  ├─ POST /rpc/Script.Create { name: "ecowatt_ingest" }
│  ├─ POST /rpc/Script.PutCode { id, code }
│  ├─ POST /rpc/Script.SetConfig { id, enable: true }
│  └─ POST /rpc/Script.Start { id }
│
├─ D) Configurar WiFi del Hogar
│  └─ POST /rpc/WiFi.SetConfig
│     {
│       sta: {
│         ssid: "TuWiFi",
│         pass: "TuPassword",
│         enable: true
│       }
│     }
│
└─ E) Reiniciar
   └─ POST /rpc/Shelly.Reboot

FASE 5: Registro en Backend
─────────────────────────
├─ Esperar 8 segundos (reinicio)
├─ Reconectar móvil a WiFi del hogar
├─ POST /api/v1/devices/
│  {
│    dev_hardware_id: "AABBCCDD" (MAYÚSCULAS),
│    dev_name: "Shelly Plus 1PM",
│    dev_mqtt_prefix: "shellyplus1pm"
│  }
└─ Forzar apagado inicial (seguridad)
   └─ POST /api/v1/control/{id}/set { state: false }

FASE 6: Éxito
─────────────────────────
└─ Pantalla de confirmación + Botón "Finalizar"
```

**Código de configuración MQTT:**

```typescript
await fetchWithTimeout(`http://192.168.33.1/rpc/Mqtt.SetConfig`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    config: {
      enable: true,
      server: '134.209.61.74:1883',
      user: 'ecowatt_shelly',
      pass: 'SjTqQh4htnRK7rqN8tsOmSgFY',
      client_id: `${mqttPrefix}-${finalMac.toLowerCase()}`, // ¡CRÍTICO: minúsculas!
      topic_prefix: `${mqttPrefix}-${finalMac.toLowerCase()}`,
      rpc_ntf: true,
      status_ntf: true,
      enable_rpc: true,
      enable_control: true
    }
  })
}, 10000);
```

**Código del script de ingestión:**

```typescript
const monitoringScript = `
let CONFIG = {
    webhook_url: "${INGESTION_URL}",
    interval: 10000 
};

function publishData() {
    Shelly.call("Switch.GetStatus", {id: 0}, function(result) {
        if (!result) return;
        
        let payload = {
            "switch:0": {
                id: 0,
                apower: result.apower || 0,
                voltage: result.voltage || 0,
                current: result.current || 0,
                output: result.output || false,
                temperature: result.temperature || {tC: 0, tF: 0}
            },
            "sys": {
                mac: "${finalMac}" // MAYÚSCULAS para BD
            }
        };
        
        Shelly.call("HTTP.POST", {
            url: CONFIG.webhook_url,
            body: JSON.stringify(payload),
            content_type: "application/json"
        }, function(res) {
            // Callback opcional
        });
    });
}

Timer.set(CONFIG.interval, true, publishData);
publishData();
`;

// Método seguro: PutCode (mejor que Script.Create con code inline)
const createRes = await fetchWithTimeout(`http://192.168.33.1/rpc/Script.Create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: "ecowatt_ingest" })
}, 5000);

const scriptId = createRes.id || 1;

await fetchWithTimeout(`http://192.168.33.1/rpc/Script.PutCode`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    id: scriptId, 
    code: monitoringScript 
  })
}, 8000);
```

**⚠️ Puntos críticos:**
- **MAC en minúsculas para MQTT**, mayúsculas para BD
- **PutCode** es más robusto que Create con code inline
- **Timeout de 8s** después de reboot antes de llamar API
- **fetchWithTimeout** previene cuelgues indefinidos

### 8.5 ProfileScreen

**Archivo: `src/screens/ProfileScreen.tsx`**

**Propósito:** Gestión de perfil y control de dispositivos.

**Estructura visual:**

```
┌─────────────────────────────┐
│          [Editar]           │
│      👤 Juan Pérez          │
│   juan@ejemplo.com          │
├─────────────────────────────┤
│ ⚡ Tarifa CFE: 1F           │
│ 📅 Día de Corte: 15         │
├─────────────────────────────┤
│   MIS DISPOSITIVOS (2)      │
├─────────────────────────────┤
│ 🔌 Shelly Sala    [ON] 🔘  │
│    AABBCCDDEE01             │
│    ENCENDIDO          🗑️    │
├─────────────────────────────┤
│ 🔌 Shelly Cocina  [OFF] ⚪  │
│    AABBCCDDEE02             │
│    APAGADO            🗑️    │
├─────────────────────────────┤
│  [+ Añadir Dispositivo]     │
├─────────────────────────────┤
│     [Cerrar Sesión]         │
└─────────────────────────────┘
```

**Lógica de control con optimistic update:**

```typescript
const ProfileScreen = ({ navigation }) => {
  const { token, logout } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [togglingDeviceId, setTogglingDeviceId] = useState<number | null>(null);

  // Cargar dispositivos + sincronizar estado real
  const loadData = useCallback(async () => {
    const devicesData = await getDevices(token);
    
    // 🔥 SINCRONIZACIÓN: Verificar estado real en Shelly
    const devicesWithRealStatus = await Promise.all(
      devicesData.map(async (device) => {
        try {
          const status = await getDeviceStatus(token, device.dev_id);
          const realState = status.status?.output ?? device.dev_status;
          return { ...device, dev_status: realState };
        } catch (e) {
          console.log(`⚠️ No se pudo verificar ${device.dev_name}`);
          return device; // Usar estado de BD
        }
      })
    );
    
    setDevices(devicesWithRealStatus);
  }, [token]);

  // Manejar switch ON/OFF
  const handleToggleDevice = async (device: Device) => {
    if (!token) return;

    const targetState = !device.dev_status;
    const deviceId = device.dev_id;

    // 1. Bloquear switch
    setTogglingDeviceId(deviceId);

    // 2. Optimistic Update (cambiar UI inmediatamente)
    setDevices(prevDevices => 
      prevDevices.map(d => 
        d.dev_id === deviceId ? { ...d, dev_status: targetState } : d
      )
    );

    try {
      console.log(`🔌 Enviando comando a ${device.dev_name}: ${targetState ? 'ON' : 'OFF'}`);
      
      // 3. Llamar API
      await setDeviceState(token, deviceId, targetState);
      
      console.log('✅ Comando enviado exitosamente');

      // ❌ NO sobreescribir con respuesta del servidor
      // (puede estar desactualizada)

    } catch (error: any) {
      console.error('⚠️ Error al cambiar estado:', error);
      
      Alert.alert(
        'Error de Conexión',
        'No se pudo comunicar con el dispositivo. Verifica que esté enchufado.'
      );
      
      // 4. Rollback: Revertir UI
      setDevices(prevDevices => 
        prevDevices.map(d => 
          d.dev_id === deviceId ? { ...d, dev_status: !targetState } : d
        )
      );
      
      // 5. Recargar estado real
      await loadData();
      
    } finally {
      // 6. Desbloquear switch
      setTogglingDeviceId(null);
    }
  };

  // Eliminar dispositivo
  const handleDeleteDevice = (device: Device) => {
    Alert.alert(
      "Eliminar Dispositivo",
      `¿Estás seguro de eliminar "${device.dev_name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDevice(token, device.dev_id);
              setDevices(prev => prev.filter(d => d.dev_id !== device.dev_id));
              Alert.alert("Éxito", "Dispositivo eliminado correctamente.");
            } catch (err) {
              Alert.alert("Error", "No se pudo eliminar el dispositivo.");
            }
          }
        }
      ]
    );
  };

  return (
    <FlatList
      data={devices}
      renderItem={({ item }) => (
        <View style={styles.deviceRow}>
          {/* Icono con color según estado */}
          <Icon 
            name="microchip" 
            size={24} 
            color={item.dev_status ? '#00FF7F' : '#888'} 
          />
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{item.dev_name}</Text>
            <Text style={styles.deviceMac}>{item.dev_hardware_id}</Text>
            <Text style={{ 
              color: item.dev_status ? '#00FF7F' : '#888',
              fontWeight: 'bold' 
            }}>
              {item.dev_status ? 'ENCENDIDO' : 'APAGADO'}
            </Text>
          </View>

          {/* Botón eliminar */}
          <TouchableOpacity 
            onPress={() => handleDeleteDevice(item)}
            disabled={togglingDeviceId === item.dev_id}
          >
            <Icon name="trash-alt" size={20} color="#FF6347" />
          </TouchableOpacity>

          {/* Switch */}
          <Switch
            trackColor={{ false: "#767577", true: "#00FF7F" }}
            thumbColor={item.dev_status ? "#FFFFFF" : "#f4f3f4"}
            onValueChange={() => handleToggleDevice(item)}
            value={item.dev_status ?? false}
            disabled={togglingDeviceId === item.dev_id}
          />
        </View>
      )}
      ListHeaderComponent={() => (
        <>
          {/* Header de perfil */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { currentUser: profile })}>
              <Icon name="pencil-alt" size={20} color="#003366" />
            </TouchableOpacity>
            <Icon name="user-circle" size={80} color="#003366" />
            <Text style={styles.userName}>{profile?.user_name}</Text>
          </View>
          
          {/* Sección de dispositivos */}
          <Text style={styles.sectionTitle}>
            Mis Dispositivos {devices.length > 0 ? `(${devices.length})` : ''}
          </Text>
        </>
      )}
      ListFooterComponent={() => (
        <>
          {/* Botón añadir */}
          <TouchableOpacity 
            style={styles.addDeviceButton}
            onPress={() => navigation.navigate('AddDevice')}
          >
            <Icon name="plus" size={18} color="#003366" />
            <Text>Añadir Nuevo Dispositivo</Text>
          </TouchableOpacity>

          {/* Botón cerrar sesión */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Icon name="sign-out-alt" size={20} color="#FFF" />
            <Text>Cerrar Sesión</Text>
          </TouchableOpacity>
        </>
      )}
      onRefresh={loadData}
      refreshing={false}
    />
  );
};
```

**Ventajas del optimistic update:**
- ✅ UI responde instantáneamente
- ✅ Usuario no espera respuesta del servidor
- ✅ Si falla, se revierte automáticamente
- ✅ Si la luz se va, se sincroniza en próxima carga

### 8.6 NotificationsScreen

**Archivo: `src/screens/NotificationsScreen.tsx`**

**Propósito:** Centro de notificaciones con historial persistente.

**Código completo:**

```typescript
const NotificationsScreen = ({ navigation }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount, clearAll } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Skeleton durante carga
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flexDirection: 'row', padding: 20 }}>
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <SkeletonLoader width="60%" height={15} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="90%" height={12} />
            </View>
          </View>
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          Notificaciones {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Icon name="check-double" size={18} color="#00FF7F" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Lista */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.item,
              item.read ? styles.itemRead : styles.itemUnread
            ]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.iconBox}>
              <Icon 
                name="bell" 
                size={18} 
                color={item.read ? '#AAA' : '#00FF7F'}
                solid={!item.read}
              />
            </View>
            
            <View style={styles.textContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[
                  styles.title,
                  !item.read && { color: '#000', fontWeight: 'bold' }
                ]}>
                  {item.title}
                </Text>
                {!item.read && <View style={styles.dot} />}
              </View>
              
              <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="bell-slash" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Estás al día</Text>
            <Text style={{ color: '#999' }}>No tienes notificaciones nuevas.</Text>
          </View>
        )}
      />
      
      {/* Footer */}
      {notifications.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearAllText}>Borrar todas</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const formatDate = (isoDateString: string) => {
  const date = new Date(isoDateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};
```

**Características:**
- ✅ Badge de punto verde en no leídas
- ✅ Opacidad reducida en leídas
- ✅ Icono de campana sólida/outline
- ✅ Timestamp formateado
- ✅ Empty state elegante

---

## 9. Servicios

### 9.1 authService.ts

**Archivo: `src/services/authService.ts`**

#### 9.1.1 Manejo de Errores Centralizado

```typescript
const handleApiError = async (response: Response) => {
  if (response.status === 401) {
    throw new Error(`Unauthorized ${response.status}`);
  }
  
  const data = await response.json();
  let errorMessage = 'Ocurrió un error inesperado.';

  if (data.detail) {
    if (Array.isArray(data.detail) && data.detail[0]?.msg) {
      errorMessage = data.detail[0].msg;
    } else if (typeof data.detail === 'string') {
      errorMessage = data.detail;
    }
  }
  
  throw new Error(errorMessage);
};
```

**Beneficios:**
- Manejo consistente de errores FastAPI
- Mensajes amigables al usuario
- Lanza excepciones tipadas

#### 9.1.2 Wrapper con Auto-Refresh

```typescript
async function fetchWithRefresh(endpoint: string, options: RequestInit): Promise<Response> {
  const store = useAuthStore.getState();

  // Primer intento
  let response = await fetch(endpoint, options);

  // Si token expiró (401) y tenemos refresh token
  if (response.status === 401 && store.refreshToken) {
    console.log('⚠️ Access Token expirado. Renovando...');
    
    try {
      // Renovar tokens
      const newTokens = await refreshAccessToken(store.refreshToken);
      store.login(newTokens.access_token, newTokens.refresh_token);

      // Actualizar header
      const newHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newTokens.access_token}`,
      };
      
      console.log('✅ Token renovado. Reintentando...');
      
      // Reintentar llamada
      response = await fetch(endpoint, { ...options, headers: newHeaders });

    } catch (error) {
      console.error('❌ Falló el refresco. Cerrando sesión.');
      store.logout();
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
    }
  }
  
  return response;
}
```

**Flujo visual:**

```
┌─────────────────────┐
│  fetch(endpoint)    │
└──────────┬──────────┘
           │
           ▼
   ┌───────────────┐
   │ Status 401?   │
   └───┬───────┬───┘
       │ No    │ Sí
       │       ▼
       │  ┌────────────────┐
       │  │ refreshToken   │
       │  │ disponible?    │
       │  └────┬───────┬───┘
       │  No   │       │ Sí
       │       │       ▼
       │       │  ┌─────────────────┐
       │       │  │ refreshAccess   │
       │       │  │ Token()         │
       │       │  └────────┬────────┘
       │       │           │
       │       │           ▼
       │       │  ┌─────────────────┐
       │       │  │ store.login()   │
       │       │  └────────┬────────┘
       │       │           │
       │       │           ▼
       │       │  ┌─────────────────┐
       │       │  │ Reintentar con  │
       │       │  │ nuevo token     │
       │       │  └────────┬────────┘
       │       │           │
       ▼       ▼           ▼
   ┌─────────────────────────┐
   │  Retornar response      │
   └─────────────────────────┘
```

#### 9.1.3 Endpoints Principales

**Registro:**
```typescript
export const registerUser = async (userData: UserRegistrationData) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) await handleApiError(response);
  return await response.json();
};
```

**Login:**
```typescript
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) await handleApiError(response);
  return await response.json() as LoginResponse;
};
```

**Perfil:**
```typescript
export const getUserProfile = async (token: string): Promise<UserProfile> => {
  const endpoint = `${API_BASE_URL}/api/v1/users/me`;
  const response = await fetchWithRefresh(endpoint, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) await handleApiError(response);
  return await response.json();
};
```

**Dashboard:**
```typescript
export const getDashboardSummary = async (token: string): Promise<DashboardSummary> => {
  const endpoint = `${API_BASE_URL}/api/v1/dashboard/summary`;
  const response = await fetchWithRefresh(endpoint, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) await handleApiError(response);
  return await response.json();
};
```

**Control de Dispositivos:**
```typescript
export const setDeviceState = async (
  token: string, 
  deviceId: number, 
  state: boolean
): Promise<ControlResponse> => {
  const endpoint = `${API_BASE_URL}/api/v1/control/${deviceId}/set`;
  
  const response = await fetchWithRefresh(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ state }),
  });

  if (!response.ok) await handleApiError(response);
  return await response.json();
};
```

### 9.2 notificationService.ts

**Archivo: `src/services/notificationService.ts`**

**Propósito:** Gestión completa de Firebase Cloud Messaging.

#### 9.2.1 Flujo de Inicialización

```
┌──────────────────────────────┐
│ 1. requestNotificationPerm() │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 2. getFCMToken()             │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 3. registerFCMToken()        │
│    → POST /api/v1/fcm/reg    │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 4. setupListeners()          │
│    → onMessage()             │
│    → onNotificationOpened()  │
│    → getInitialNotification()│
└──────────────────────────────┘
```

#### 9.2.2 Solicitar Permisos

```typescript
export async function requestNotificationPermission() {
  try {
    // Android 13+ requiere permiso runtime
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('❌ Permiso de Android 13+ denegado');
        return false;
      }
    }

    // Permiso de Firebase
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging().AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging().AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Permisos de notificaciones concedidos');
      return true;
    } else {
      console.log('⚠️ Permisos denegados');
      return false;
    }
  } catch (error) {
    console.error('❌ Error pidiendo permisos:', error);
    return false;
  }
}
```

#### 9.2.3 Obtener Token FCM

```typescript
export async function getFCMToken() {
  try {
    // iOS requiere registro explícito
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    const token = await messaging().getToken();
    console.log('📱 FCM Token obtenido:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
    return null;
  }
}
```

#### 9.2.4 Registrar en Backend

```typescript
export async function registerFCMToken(accessToken: string) {
  try {
    const fcmToken = await getFCMToken();
    if (!fcmToken) return false;

    const deviceName = await DeviceInfo.getDeviceName();
    const platform = Platform.OS;

    const response = await fetch(`${API_BASE_URL}/api/v1/fcm/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcm_token: fcmToken,
        device_name: deviceName,
        platform: platform
      }),
    });

    if (response.ok) {
      console.log('✅ Token FCM registrado en backend');
      return true;
    } else {
      console.warn('⚠️ Error al registrar token');
      return false;
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    return false;
  }
}
```

#### 9.2.5 Configurar Listeners

```typescript
export function setupNotificationListeners() {
  const addNotification = useNotificationStore.getState().addNotification;
  
  const handleNotification = (remoteMessage: any) => {
    if (remoteMessage?.notification) {
      addNotification({
        title: remoteMessage.notification.title || 'Notificación EcoWatt',
        body: remoteMessage.notification.body || 'Revisa tus alertas.',
      });
      console.log('🔔 Notificación guardada:', remoteMessage.notification.title);
    }
  };
  
  // FOREGROUND: App abierta
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('🔔 Notificación recibida (foreground)');
    handleNotification(remoteMessage);
  });

  // BACKGROUND: Usuario abre app desde notificación
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('🔔 App abierta desde background');
    handleNotification(remoteMessage);
  });

  // QUIT STATE: App iniciada por notificación
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('🔔 App iniciada por notificación');
        handleNotification(remoteMessage);
      }
    });

  return unsubscribe;
}
```

#### 9.2.6 Función de Inicialización Completa

```typescript
export async function initializeNotificationService(accessToken: string) {
  try {
    // 1. Permisos
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    // 2. Registrar token
    const registered = await registerFCMToken(accessToken);
    if (!registered) return false;

    // 3. Configurar listeners
    setupNotificationListeners();

    console.log('✅ Sistema de notificaciones inicializado');
    return true;
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    return false;
  }
}
```

**Uso en la app:**

```typescript
// En useAuthStore.ts - Al hacer login
login: (accessToken, refreshToken) => {
  set({
    isAuthenticated: true,
    token: accessToken,
    refreshToken,
  });
  
  // Inicializar notificaciones
  initializeNotificationService(accessToken);
},

// Al restaurar sesión desde AsyncStorage
onRehydrateStorage: () => (state) => {
  if (state?.isAuthenticated && state?.token) {
    console.log('Restaurando notificaciones...');
    initializeNotificationService(state.token);
  }
},
```

### 9.3 reportService.ts

**Archivo: `src/services/reportService.ts`**

**Propósito:** Obtener datos para reportes mensuales.

#### 9.3.1 Reporte Histórico (Meses Pasados)

```typescript
export const getMonthlyReport = async (
  token: string, 
  month: number, // 1-12
  year: number
): Promise<MonthlyReportData> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports/monthly`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ month, year }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo obtener el reporte.`);
  }
  
  return await response.json() as MonthlyReportData;
};
```

#### 9.3.2 Reporte del Mes Actual (Tiempo Real)

```typescript
export const getCurrentMonthlyReport = async (token: string): Promise<MonthlyReportData> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports/monthly/current`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo obtener el reporte actual.`);
  }
  
  return await response.json() as MonthlyReportData;
};
```

**Diferencia clave:**
- **Histórico** usa POST con mes/año específico → Lee de PostgreSQL
- **Actual** usa GET → Lee de Redis (datos en tiempo real)

### 9.4 PDFGenerator.tsx

**Archivo: `src/services/PDFGenerator.tsx`**

**Propósito:** Generar reportes PDF con datos de consumo y costos CFE.

#### 9.4.1 Estructura del Reporte

```typescript
interface MonthlyReportData {
  header: {
    period_month: string;
    user_name: string;
    user_email: string;
    billing_cycle_start: string;
    billing_cycle_end: string;
  };
  executive_summary: {
    total_estimated_cost_mxn: number;
    total_kwh_consumed: number;
  };
  cost_breakdown: {
    applied_tariff: string;
    tariff_levels: TariffLevel[];
    fixed_charge_mxn: number;
    total_cost_mxn: number;
  };
  consumption_details: {
    daily_consumption: DailyConsumptionPoint[];
    average_daily_consumption: number;
    highest_consumption_day: DailyConsumptionPoint;
    lowest_consumption_day: DailyConsumptionPoint;
  };
  alerts: Alert[];
  recommendations: string[];
}
```

#### 9.4.2 Análisis de Ahorro

```typescript
const calculateSavingsData = (data: MonthlyReportData) => {
  // Buscar consumo en tarifa "Excedente"
  const excedenteLevel = data.cost_breakdown.tariff_levels.find(
    (l: TariffLevel) => l.level_name.includes("Excedente")
  );

  if (!excedenteLevel || excedenteLevel.kwh_consumed === 0) {
    return { 
      hasSavings: false, 
      amount: 0,
      title: "✅ Consumo Eficiente",
      message: "Tu consumo se mantiene dentro de los rangos óptimos. ¡Sigue así!" 
    };
  }

  return {
    hasSavings: true,
    amount: excedenteLevel.subtotal_mxn,
    title: "💰 Oportunidad de Ahorro",
    message: `El consumo en tarifa Excedente representó <strong>${excedenteLevel.subtotal_mxn.toFixed(2)}</strong> extra. ¡Intenta reducirlo!`
  };
};
```

#### 9.4.3 Template HTML del PDF

```typescript
const getReportHtml = (data: MonthlyReportData): string => {
  const savings = calculateSavingsData(data);
  const generatedDate = new Date().toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Generar filas de tarifas
  const tariffRows = data.cost_breakdown.tariff_levels.map((level) => {
    const isExcedente = level.level_name.includes("Excedente");
    const cleanName = level.level_name.replace(/\*\*/g, '');
    
    return `
      <tr class="${isExcedente ? 'excedente-row' : ''}">
        <td>${cleanName}</td>
        <td style="text-align: right;">${level.kwh_consumed.toFixed(2)}</td>
        <td style="text-align: right;">${level.price_per_kwh.toFixed(2)}</td>
        <td style="text-align: right; font-weight: bold;">${level.subtotal_mxn.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // Generar lista de alertas
  const alertList = data.alerts && data.alerts.length > 0 
    ? data.alerts.map(a => `
        <li class="alert-item">
          <strong>${a.title}:</strong> ${a.body}
        </li>
      `).join('')
    : '<li class="alert-item" style="background-color: #d1e7dd; color: #0f5132;">✅ Sin incidencias.</li>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Helvetica, Arial, sans-serif; 
          color: #333; 
          padding: 0; 
          margin: 0; 
        }
        
        .header { 
          background-color: #008060; 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
          border-bottom: 5px solid #00FF7F; 
        }
        
        h1 { 
          margin: 0; 
          font-size: 24px; 
          text-transform: uppercase; 
          letter-spacing: 1px; 
        }
        
        .container { 
          padding: 25px; 
          max-width: 800px; 
          margin: 0 auto; 
        }
        
        h2 { 
          color: #008060; 
          border-left: 5px solid #00FF7F; 
          padding-left: 10px; 
          margin-top: 25px; 
          font-size: 18px; 
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px; 
          font-size: 13px; 
        }
        
        th { 
          background-color: #f0f2f5; 
          padding: 12px; 
          text-align: left; 
          border-bottom: 2px solid #ddd; 
        }
        
        td { 
          border-bottom: 1px solid #eee; 
          padding: 10px; 
        }
        
        .excedente-row td { 
          background-color: #fff5f5; 
          color: #c53030; 
          font-weight: bold; 
        }
        
        .total-row td { 
          font-weight: bold; 
          background-color: #f9f9f9; 
        }
        
        .total-final { 
          background-color: #d1e7dd; 
          color: #0f5132; 
          font-size: 16px; 
          border-top: 2px solid #008060; 
        }
        
        .total-final td { 
          padding: 15px 10px; 
          font-weight: 800; 
        }
        
        .summary-box { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 20px; 
          border: 1px solid #ddd; 
          text-align: center; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
        }
        
        .big-num { 
          font-size: 28px; 
          font-weight: bold; 
          color: #dc3545; 
          display: block; 
          margin-top: 5px; 
        }
        
        .savings-box { 
          background-color: ${savings.hasSavings ? '#e6ffed' : '#f0f9ff'}; 
          border: 1px solid ${savings.hasSavings ? '#28a745' : '#bde0fe'}; 
          padding: 20px; 
          border-radius: 8px; 
          margin-top: 15px; 
        }
        
        .savings-amount { 
          color: #dc3545; 
          font-size: 32px; 
          font-weight: bold; 
          display: block; 
          margin: 10px 0; 
        }
        
        .alert-item { 
          background-color: #fff3cd; 
          padding: 10px; 
          margin-bottom: 5px; 
          border-radius: 4px; 
          font-size: 12px; 
          list-style: none; 
          border-left: 3px solid #ffc107; 
        }
        
        .footer { 
          text-align: center; 
          font-size: 10px; 
          color: #999; 
          margin-top: 50px; 
          border-top: 1px solid #eee; 
          padding-top: 15px; 
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <h1>Estado de Cuenta</h1>
        <p style="margin: 5px 0; opacity: 0.9;">${data.header.period_month}</p>
        <p style="font-size: 14px;">${data.header.user_name}</p>
        <p style="font-size: 10px; margin-top:0;">${data.header.user_email}</p>
      </div>
      
      <!-- Contenido -->
      <div class="container">
        <!-- Resumen Ejecutivo -->
        <div class="summary-box">
          <span style="font-size: 12px; text-transform: uppercase; color: #666;">
            Total Estimado a Pagar
          </span>
          <span class="big-num">
            ${data.executive_summary.total_estimated_cost_mxn.toFixed(2)} MXN
          </span>
          <span style="font-size: 10px; color: #999;">
            Periodo: ${data.header.billing_cycle_start} - ${data.header.billing_cycle_end}
          </span>
        </div>
        
        <!-- Desglose de Costos -->
        <h2>Desglose de Costos</h2>
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th style="text-align: right">Consumo (kWh)</th>
              <th style="text-align: right">Precio</th>
              <th style="text-align: right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${tariffRows}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Cargo Fijo</td>
              <td style="text-align: right;">${data.cost_breakdown.fixed_charge_mxn.toFixed(2)}</td>
            </tr>
            <tr class="total-final">
              <td colspan="3" style="text-align: right;">TOTAL ESTIMADO</td>
              <td style="text-align: right;">${data.cost_breakdown.total_cost_mxn.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Análisis de Ahorro -->
        <h2>Análisis de Ahorro</h2>
        <div class="savings-box">
          <strong style="color: #008060; font-size: 16px;">${savings.title}</strong>
          ${savings.hasSavings ? `<span class="savings-amount">${savings.amount.toFixed(2)} MXN</span>` : '<br><br>'}
          <p style="margin: 0; color: #155724;">${savings.message}</p>
        </div>
        
        <!-- Alertas -->
        <h2>Alertas y Avisos</h2>
        <ul style="padding: 0;">
          ${alertList}
        </ul>
        
        <!-- Footer -->
        <div class="footer">
          Generado el ${generatedDate}<br>
          Documento informativo generado por EcoWatt, no oficial ante CFE.
        </div>
      </div>
    </body>
    </html>
  `;
};
```

#### 9.4.4 Función de Generación

```typescript
export const generateEcoWattReport = async (reportData: MonthlyReportData): Promise<PDFResult> => {
  try {
    console.log("📄 Iniciando generación de PDF...");
    
    const htmlContent = getReportHtml(reportData);
    const jobName = `EcoWatt_Reporte_${new Date().toISOString().substring(0, 10)}`;

    // react-native-print abre interfaz nativa del SO
    await RNPrint.print({
      html: htmlContent,
      jobName: jobName
    });

    // Android: Usuario selecciona "Guardar como PDF" desde el diálogo
    // iOS: Muestra selector de impresora o AirDrop
    
    console.log("✅ PDF generado exitosamente");
    return { success: true, path: 'Guardado por el usuario' };

  } catch (error: any) {
    console.error("❌ Error en generación:", error);
    return { 
      success: false, 
      path: '', 
      error: error.message || 'Error al generar PDF' 
    };
  }
};
```

**Nota importante para Android:**
El usuario debe seleccionar manualmente "Guardar como PDF" desde el selector de impresoras. La app no controla la ruta final del archivo por limitaciones de la API.

---

## 10. Estilos y Diseño

### 10.1 Sistema de Colores

**Paleta principal:**

```typescript
// Colores primarios
const COLOR_PRIMARY_BLUE = '#003366';    // Azul oscuro corporativo
const COLOR_PRIMARY_GREEN = '#00FF7F';   // Verde neón (acción)
const COLOR_ACCENT_GREEN = 'rgba(0, 255, 127, 0.15)'; // Verde transparente

// Colores de estado
const COLOR_SUCCESS = '#28a745';         // Verde éxito
const COLOR_ERROR = '#E74C3C';           // Rojo error
const COLOR_WARNING = '#FFA500';         // Naranja advertencia
const COLOR_INFO = '#3498db';            // Azul info

// Grises y neutros
const COLOR_BACKGROUND_DARK = '#0A192F'; // Fondo oscuro
const COLOR_CARD_BG = 'rgba(20, 20, 30, 0.75)'; // Tarjetas con glassmorphism
const COLOR_TEXT_LIGHT = '#FFFFFF';      // Texto claro
const COLOR_TEXT_DARK = '#333333';       // Texto oscuro
const COLOR_TEXT_MUTED = '#888888';      // Texto secundario

// Colores especiales
const LIVE_COLOR = '#FF4500';            // Naranja para datos en vivo
const BORDER_COLOR = 'rgba(255, 255, 255, 0.1)'; // Bordes sutiles
```

**Uso en componentes:**

```typescript
// Tarjeta con fondo semitransparente
<View style={{
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  borderRadius: 15,
  padding: 20,
}}>
  <Text style={{ color: '#FFFFFF' }}>Contenido</Text>
</View>

// Botón con sombra de neón
<TouchableOpacity style={{
  backgroundColor: '#00FF7F',
  paddingVertical: 15,
  borderRadius: 10,
  shadowColor: '#00FF7F',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 15,
  elevation: 10,
}}>
  <Text style={{ color: '#003366', fontWeight: 'bold' }}>Acción</Text>
</TouchableOpacity>
```

### 10.2 Tipografía

**Jerarquía de texto:**

```typescript
const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  body: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
```

### 10.3 Espaciado y Layout

**Sistema de spacing:**

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Uso
<View style={{ 
  padding: spacing.lg,
  marginBottom: spacing.md,
}}>
```

**Grid system:**

```typescript
// Tarjetas en 2 columnas
<View style={{
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
}}>
  <View style={{ width: '48%' }}>
    {/* Tarjeta 1 */}
  </View>
  <View style={{ width: '48%' }}>
    {/* Tarjeta 2 */}
  </View>
</View>
```

### 10.4 Componentes de UI Comunes

**Tarjeta con glassmorphism:**

```typescript
const glassCard = {
  backgroundColor: 'rgba(20, 20, 30, 0.75)',
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 5,
};
```

**Badge de notificación:**

```typescript
const notificationBadge = {
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
};
```

**Tab bar flotante:**

```typescript
tabBarStyle: {
  position: 'absolute',
  bottom: Platform.OS === 'ios' ? 30 : 20,
  left: 20,
  right: 20,
  backgroundColor: 'rgba(40, 40, 40, 0.9)',
  borderRadius: 30,
  height: 70,
  borderTopWidth: 0,
  elevation: 8,
  shadowColor: '#00FF7F',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 8,
}
```

### 10.5 Responsividad

**Uso de Dimensions:**

```typescript
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Gráfica responsive
<BarChart
  width={screenWidth - 60} // 30px padding a cada lado
  height={220}
  // ...
/>

// Card que ocupa porcentaje del ancho
<View style={{ 
  width: screenWidth * 0.9,
  maxWidth: 400, // Límite para tablets
}}>
```

**Detección de orientación:**

```typescript
import { useWindowDimensions } from 'react-native';

const MyComponent = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  return (
    <View style={{ 
      flexDirection: isLandscape ? 'row' : 'column' 
    }}>
      {/* Contenido adaptativo */}
    </View>
  );
};
```

---

## 11. Integraciones

### 11.1 Firebase Cloud Messaging

**Configuración completa ya cubierta en sección 9.2**

**Payload de notificación esperado:**

```json
{
  "notification": {
    "title": "Alerta de Consumo",
    "body": "Tu consumo superó el 80% del límite mensual"
  },
  "data": {
    "type": "consumption_alert",
    "device_id": "123",
    "threshold": "80"
  }
}
```

**Manejo en el store:**

```typescript
// Guardar en historial local
addNotification({
  title: notification.title,
  body: notification.body
});

// Opcional: Navegar a pantalla específica según data.type
if (data.type === 'consumption_alert') {
  navigation.navigate('Stats');
}
```

### 11.2 WebSocket (Datos en Tiempo Real)

**Conexión:**

```typescript
const ws = new WebSocket(
  `wss://core-cloud.dev/ws/live/${deviceId}?token=${token}`
);
```

**Estados del WebSocket:**

| Estado | Significado | Acción en UI |
|--------|-------------|--------------|
| `connecting` | Estableciendo conexión | Mostrar "CONECTANDO..." |
| `connected` | Conexión activa | Badge verde pulsante "EN VIVO" |
| `disconnected` | Sin conexión | Badge gris "OFFLINE" |
| `error` | Error de conexión | Mostrar mensaje de error |

**Reconexión automática:**

```typescript
// Reintentar hasta 3 veces con backoff exponencial
socket.onclose = (e) => {
  if (e.code !== 1000 && reconnectAttempts < 3) {
    const delay = 1000 * (reconnectAttempts + 1);
    setTimeout(() => connectWebSocket(), delay);
    reconnectAttempts++;
  }
};
```

**Formato de mensaje recibido:**

```json
{
  "watts": 1234.56,
  "timestamp": "2025-12-11T10:30:00Z"
}
```

O alternativas compatibles:
```json
{ "apower": 1234.56 }
{ "power": 1234.56 }
{ "value": 1234.56 }
```

### 11.3 WiFi Manager (Escaneo y Conexión)

**Permisos necesarios (Android):**

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />

<!-- Android 13+ -->
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
```

**Escanear redes:**

```typescript
import WifiManager from 'react-native-wifi-reborn';

const networks = await WifiManager.loadWifiList();
const shellyNetworks = networks.filter(n => 
  n.SSID.toLowerCase().startsWith('shelly')
);
```

**Conectar a red:**

```typescript
await WifiManager.connectToProtectedSSID(
  'ShellyPlus1PM-AABBCCDDEE01', // SSID
  '',                            // Password (vacío para Shelly AP)
  false,                         // isWEP
  false                          // isHidden
);
```

**Verificar conexión:**

```typescript
const currentSSID = await WifiManager.getCurrentWifiSSID();
console.log('Conectado a:', currentSSID);
```

---

## 12. Optimizaciones y Performance

### 12.1 Optimización de Re-renders

**useMemo para datos procesados:**

```typescript
const processedData = useMemo(() => {
  return data.map(item => ({
    ...item,
    formattedValue: formatValue(item.value)
  }));
}, [data]);
```

**useCallback para funciones pasadas a hijos:**

```typescript
const handlePress = useCallback((id: number) => {
  console.log('Pressed:', id);
}, []); // Sin dependencias si no usa estado externo

<ChildComponent onPress={handlePress} />
```

**React.memo para componentes puros:**

```typescript
const DeviceRow = React.memo(({ item, onToggle }) => {
  return (
    <View>
      <Text>{item.name}</Text>
      <Switch value={item.status} onValueChange={() => onToggle(item)} />
    </View>
  );
});
```

### 12.2 Lazy Loading de Imágenes

**Uso de FastImage (recomendado para producción):**

```bash
npm install react-native-fast-image
```

```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  style={{ width: 200, height: 200 }}
  source={{
    uri: 'https://example.com/image.jpg',
    priority: FastImage.priority.normal,
  }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### 12.3 Virtualización de Listas

**FlatList con optimizaciones:**

```typescript
<FlatList
  data={devices}
  renderItem={({ item }) => <DeviceRow item={item} />}
  keyExtractor={(item) => item.dev_id.toString()}
  
  // Optimizaciones
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  
  // Pull to refresh
  onRefresh={loadData}
  refreshing={isLoading}
  
  // Indicadores de carga
  ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

### 12.4 Caché de Datos

**Estrategia de caché con AsyncStorage:**

```typescript
const CACHE_KEY = 'dashboard_summary';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCachedData = async () => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (e) {}
  return null;
};

const setCachedData = async (data: any) => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {}
};
```

### 12.5 Debounce de Búsquedas

```typescript
import { useCallback, useEffect, useState } from 'react';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Uso
const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <TextInput
      value={searchTerm}
      onChangeText={setSearchTerm}
      placeholder="Buscar..."
    />
  );
};
```

---

## 13. Seguridad

### 13.1 Almacenamiento Seguro de Tokens

**Zustand + AsyncStorage:**

```typescript
// ✅ BUENO: Tokens en AsyncStorage (encriptado en iOS, protegido en Android)
persist(
  (set, get) => ({ /* estado */ }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => AsyncStorage)
  }
)

// ❌ MALO: Tokens en variables globales o localStorage web
```

**Para mayor seguridad (opcional):**

```bash
npm install react-native-keychain
```

```typescript
import * as Keychain from 'react-native-keychain';

// Guardar
await Keychain.setGenericPassword('token', accessToken);

// Leer
const credentials = await Keychain.getGenericPassword();
if (credentials) {
  console.log('Token:', credentials.password);
}
```

### 13.2 Validación de Inputs

**Ejemplo: Validación de email:**

```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleRegister = async () => {
  if (!isValidEmail(email)) {
    setError('Ingresa un correo válido');
    return;
  }
  
  if (password.length < 8) {
    setError('La contraseña debe tener al menos 8 caracteres');
    return;
  }
  
  // Continuar con registro...
};
```

### 13.3 Sanitización de Datos

**Prevención de XSS en WebView:**

```typescript
const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};
```

### 13.4 HTTPS y Certificados

**Configuración de red segura (Android):**

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

**Pinning de certificados SSL (opcional para producción):**

```typescript
// En fetch options
const response = await fetch(API_URL, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  // Verificación adicional de certificado
});
```

### 13.5 Timeout de Sesión

**Auto-logout por inactividad:**

```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

let inactivityTimer: NodeJS.Timeout;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  
  inactivityTimer = setTimeout(() => {
    Alert.alert(
      'Sesión Expirada',
      'Has estado inactivo por mucho tiempo. Por seguridad, cerraremos tu sesión.',
      [{ text: 'OK', onPress: () => useAuthStore.getState().logout() }]
    );
  }, SESSION_TIMEOUT);
};

// En App.tsx
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      resetInactivityTimer();
    }
  });

  resetInactivityTimer();

  return () => {
    clearTimeout(inactivityTimer);
    subscription.remove();
  };
}, []);
```

### 13.6 Protección contra Inyecciones

**Validación en registro de dispositivos:**

```typescript
const validateMacAddress = (mac: string): boolean => {
  // Formato: AABBCCDDEE01 (12 caracteres hexadecimales)
  const macRegex = /^[A-F0-9]{12}$/i;
  return macRegex.test(mac);
};

const registerShellyDevice = async (name: string, mac: string) => {
  // Sanitizar entrada
  const cleanName = name.trim().substring(0, 50);
  const cleanMac = mac.toUpperCase().replace(/[^A-F0-9]/g, '');
  
  if (!validateMacAddress(cleanMac)) {
    throw new Error('MAC address inválida');
  }
  
  // Continuar con registro...
};
```

---

## 14. Testing y Debugging

### 14.1 Debugging con React Native Debugger

**Instalación:**

```bash
# macOS
brew install --cask react-native-debugger

# Windows/Linux: Descargar desde GitHub
```

**Uso:**
1. Abrir React Native Debugger
2. En la app: Shake device → "Debug"
3. Inspeccionar Redux, Network, Console

**Console.log personalizado:**

```typescript
const logDev = (message: string, data?: any) => {
  if (__DEV__) {
    console.log(`[EcoWatt] ${message}`, data || '');
  }
};

logDev('Usuario autenticado', { userId: 123 });
```

### 14.2 Debugging de Red

**Interceptar llamadas Fetch:**

```typescript
const originalFetch = global.fetch;

global.fetch = async (url, options) => {
  console.log('📡 Request:', url, options?.method || 'GET');
  
  const startTime = Date.now();
  const response = await originalFetch(url, options);
  const duration = Date.now() - startTime;
  
  console.log(`✅ Response: ${response.status} (${duration}ms)`);
  
  return response;
};
```

**Usar Reactotron (herramienta avanzada):**

```bash
npm install --save-dev reactotron-react-native
```

```typescript
// ReactotronConfig.ts
import Reactotron from 'reactotron-react-native';

Reactotron
  .configure({ name: 'EcoWatt' })
  .useReactNative()
  .connect();

// En cualquier componente
Reactotron.log('Datos cargados', data);
```

### 14.3 Testing con Jest

**Configuración básica:**

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

**Ejemplo de test (authService):**

```typescript
// __tests__/services/authService.test.ts
import { loginUser } from '../../src/services/authService';

global.fetch = jest.fn();

describe('authService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should login successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'test_token',
        refresh_token: 'test_refresh'
      })
    });

    const result = await loginUser({
      user_email: 'test@example.com',
      user_password: 'password123'
    });

    expect(result.access_token).toBe('test_token');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should handle login error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid credentials' })
    });

    await expect(
      loginUser({
        user_email: 'test@example.com',
        user_password: 'wrong'
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

**Test de componente:**

```typescript
// __tests__/components/CustomInput.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomInput from '../../src/components/CustomInput';

describe('CustomInput', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <CustomInput placeholder="Email" />
    );
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const handleChange = jest.fn();
    const { getByPlaceholderText } = render(
      <CustomInput 
        placeholder="Email" 
        onChangeText={handleChange} 
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    
    expect(handleChange).toHaveBeenCalledWith('test@example.com');
  });
});
```

### 14.4 Logging de Errores

**Captura global de errores:**

```typescript
// App.tsx
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Algo salió mal:</Text>
      <Text>{error.message}</Text>
      <Button title="Reintentar" onPress={resetErrorBoundary} />
    </View>
  );
};

const App = () => {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error capturado:', error, errorInfo);
        // Enviar a servicio de logging (Sentry, etc.)
      }}
    >
      <NavigationContainer>
        {/* App content */}
      </NavigationContainer>
    </ErrorBoundary>
  );
};
```

**Integración con Sentry (opcional):**

```bash
npm install @sentry/react-native
```

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});

// Capturar error manualmente
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

### 14.5 Performance Monitoring

**Medir tiempo de carga:**

```typescript
const startTime = performance.now();

await loadData();

const endTime = performance.now();
console.log(`Carga completada en ${(endTime - startTime).toFixed(2)}ms`);
```

**Monitorear re-renders:**

```typescript
import { useEffect, useRef } from 'react';

const useWhyDidYouUpdate = (name: string, props: any) => {
  const previousProps = useRef<any>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: any = {};

      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
};

// Uso
const MyComponent = (props) => {
  useWhyDidYouUpdate('MyComponent', props);
  // ...
};
```

---

## 15. Despliegue y Distribución

### 15.1 Build de Producción (Android)

**Generar APK de release:**

```bash
cd android
./gradlew assembleRelease
```

**Ubicación del APK:**
```
android/app/build/outputs/apk/release/app-release.apk
```

**Generar AAB (Google Play):**

```bash
cd android
./gradlew bundleRelease
```

**Ubicación del AAB:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Firmar manualmente (si es necesario):**

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app-release-unsigned.apk alias_name
```

### 15.2 Build de Producción (iOS)

**Abrir Xcode:**

```bash
cd ios
open EcowattNuevo.xcworkspace
```

**Pasos en Xcode:**
1. Product → Scheme → Edit Scheme
2. Run → Build Configuration → **Release**
3. Product → Archive
4. Window → Organizer → Distribute App
5. Seleccionar método de distribución (App Store, Ad Hoc, etc.)

**Build desde línea de comandos:**

```bash
cd ios
xcodebuild -workspace EcowattNuevo.xcworkspace \
  -scheme EcowattNuevo \
  -configuration Release \
  -archivePath build/EcowattNuevo.xcarchive \
  archive
```

### 15.3 Versionado

**Actualizar versión (Android):**

```gradle
// android/app/build.gradle
android {
    defaultConfig {
        versionCode 2        // Incrementar para cada release
        versionName "1.0.1"  // Versión visible para usuarios
    }
}
```

**Actualizar versión (iOS):**

```
Xcode → Target EcowattNuevo → General
- Version: 1.0.1
- Build: 2
```

**O desde Info.plist:**

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.1</string>
<key>CFBundleVersion</key>
<string>2</string>
```

### 15.4 Variables de Entorno por Build

**Usar react-native-config:**

```bash
npm install react-native-config
```

**Crear archivos .env:**

```
# .env.production
API_BASE_URL=https://api.ecowatt.com
ENVIRONMENT=production

# .env.staging
API_BASE_URL=https://staging-api.ecowatt.com
ENVIRONMENT=staging
```

**Uso en código:**

```typescript
import Config from 'react-native-config';

const API_BASE_URL = Config.API_BASE_URL;
console.log('Environment:', Config.ENVIRONMENT);
```

**Build con entorno específico:**

```bash
# Android
ENVFILE=.env.production npm run android

# iOS
ENVFILE=.env.production npm run ios
```

### 15.5 Code Push (Actualizaciones OTA)

**Instalación:**

```bash
npm install react-native-code-push
```

**Configuración en AppCenter:**

1. Crear cuenta en https://appcenter.ms
2. Crear apps para iOS y Android
3. Obtener deployment keys

**Configuración en código:**

```typescript
// App.tsx
import codePush from 'react-native-code-push';

const App = () => {
  // ...
};

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
};

export default codePush(codePushOptions)(App);
```

**Liberar actualización:**

```bash
appcenter codepush release-react -a username/EcoWatt-Android \
  -d Production
```

---

## 16. Troubleshooting Común

### 16.1 Problemas de Build

**Error: "Unable to resolve module"**

```bash
# Limpiar caché
npm start -- --reset-cache

# Reinstalar dependencias
rm -rf node_modules
npm install

# iOS: Reinstalar pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Error: "Task :app:installDebug FAILED"**

```bash
# Android: Limpiar build
cd android
./gradlew clean
cd ..

# Verificar que solo un emulador esté corriendo
adb devices
```

**Error: "Command PhaseScriptExecution failed"**

```bash
# iOS: Limpiar derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# En Xcode: Product → Clean Build Folder
```

### 16.2 Problemas de Firebase

**Error: "Default FirebaseApp is not initialized"**

```typescript
// Verificar que firebase se inicialice ANTES de usarse
// En App.tsx, al inicio:

import firebase from '@react-native-firebase/app';

if (!firebase.apps.length) {
  firebase.initializeApp();
}
```

**Error: "google-services.json not found"**

```bash
# Verificar ubicación correcta
ls android/app/google-services.json

# Debe estar en:
# android/app/google-services.json (NO en android/)
```

### 16.3 Problemas de Permisos

**Error: "Location permission denied"**

```typescript
// Verificar que se soliciten ANTES de escanear WiFi
const granted = await requestWiFiPermissions();
if (!granted) {
  Alert.alert('Permisos Requeridos', 'Habilita permisos de ubicación en Configuración');
  return;
}
```

**Android 13+: "Nearby WiFi devices permission"**

```typescript
if (Platform.Version >= 33) {
  const permissions = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    'android.permission.NEARBY_WIFI_DEVICES' as any
  ];
  await PermissionsAndroid.requestMultiple(permissions);
}
```

### 16.4 Problemas de WebSocket

**Error: "WebSocket connection failed"**

```typescript
// Verificar URL correcta
const wsUrl = `wss://core-cloud.dev/ws/live/${deviceId}?token=${token}`;

// Agregar logs detallados
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  console.log('URL intentada:', wsUrl);
};

ws.onclose = (e) => {
  console.log('WebSocket cerrado. Código:', e.code);
  console.log('Razón:', e.reason);
};
```

**WebSocket se desconecta constantemente:**

```typescript
// Implementar heartbeat (ping/pong)
let pingInterval: NodeJS.Timeout;

ws.onopen = () => {
  pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000); // Cada 30 segundos
};

ws.onclose = () => {
  clearInterval(pingInterval);
};
```

### 16.5 Problemas con Shelly

**Error: "Cannot connect to 192.168.33.1"**

```typescript
// Verificar que el móvil esté conectado a la red del Shelly
const currentSSID = await WifiManager.getCurrentWifiSSID();
console.log('Conectado a:', currentSSID);

// Debe mostrar algo como: "ShellyPlus1PM-AABBCCDDEE01"

// Agregar timeout a las peticiones
const fetchWithTimeout = async (url: string, options: RequestInit, ms: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};
```

**Script no se instala correctamente:**

```typescript
// SIEMPRE usar PutCode, NO Create con code inline
// 1. Crear vacío
const res = await fetch('http://192.168.33.1/rpc/Script.Create', {
  method: 'POST',
  body: JSON.stringify({ name: 'ecowatt_ingest' })
});

const { id } = await res.json();

// 2. Inyectar código
await fetch('http://192.168.33.1/rpc/Script.PutCode', {
  method: 'POST',
  body: JSON.stringify({ id, code: scriptContent })
});
```

---

## 17. Recursos Adicionales

### 17.1 Documentación Oficial

- **React Native**: https://reactnative.dev/docs/getting-started
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **Zustand**: https://docs.pmnd.rs/zustand/getting-started/introduction
- **Firebase (React Native)**: https://rnfirebase.io/
- **Shelly API**: https://shelly-api-docs.shelly.cloud/gen2/

### 17.2 Herramientas Recomendadas

| Herramienta | Propósito | URL |
|-------------|-----------|-----|
| React Native Debugger | Debugging avanzado | https://github.com/jhen0409/react-native-debugger |
| Reactotron | Inspección de estado | https://github.com/infinitered/reactotron |
| Flipper | Debugging nativo | https://fbflipper.com/ |
| Postman | Testing de API | https://www.postman.com/ |
| Android Studio | Desarrollo Android | https://developer.android.com/studio |
| Xcode | Desarrollo iOS | https://developer.apple.com/xcode/ |

### 17.3 Comunidades y Soporte

- **Discord de React Native**: https://discord.gg/reactnative
- **Stack Overflow**: Tag `react-native`
- **GitHub Issues**: Repositorios de las librerías usadas

### 17.4 Mejores Prácticas

**Estructura de carpetas recomendada para escalar:**

```
src/
├── @types/          # TypeScript definitions
├── api/             # API clients y endpoints
├── assets/          # Imágenes, fuentes, etc.
├── components/      # Componentes reutilizables
│   ├── common/      # Botones, inputs, etc.
│   └── domain/      # Componentes específicos (DeviceCard, etc.)
├── config/          # Configuraciones
├── constants/       # Constantes de la app
├── hooks/           # Custom hooks
├── navigation/      # Navegación
├── screens/         # Pantallas
├── services/        # Lógica de negocio
├── store/           # Estado global
├── styles/          # Estilos
├── utils/           # Utilidades
└── App.tsx
```

**Naming conventions avanzadas:**

```typescript
// Hooks personalizados
useDeviceList.ts
useAuth.ts

// Servicios
authService.ts
deviceService.ts

// Tipos compartidos
types/User.ts
types/Device.ts

// Constantes
constants/colors.ts
constants/routes.ts
```

---

## 18. Changelog y Versionado

### Versión 1.0.0 (Actual)

**Características:**
- ✅ Autenticación completa (login, registro, recuperación)
- ✅ Dashboard con resumen de consumo
- ✅ Gráficas históricas (diario, semanal, mensual)
- ✅ Control remoto de dispositivos Shelly
- ✅ Datos en tiempo real vía WebSocket
- ✅ Notificaciones push con FCM
- ✅ Generación de reportes PDF
- ✅ Configuración automática de dispositivos Shelly

**Próximas funcionalidades (Roadmap):**
- 🔲 Soporte para múltiples tarifas CFE
- 🔲 Programación de horarios de encendido/apagado
- 🔲 Comparativa de consumo con usuarios similares
- 🔲 Integración con Google Assistant / Alexa
- 🔲 Widget de home screen
- 🔲 Modo oscuro
- 🔲 Soporte para más dispositivos (Shelly 2PM, etc.)

---

## 19. Contacto y Contribución

### 19.1 Reporte de Bugs

Si encuentras un error:
1. Verificar que no esté ya reportado en Issues
2. Incluir logs completos
3. Especificar versión de la app y SO
4. Pasos para reproducir el error

### 19.2 Solicitudes de Funcionalidades

Para solicitar nuevas características:
1. Describir el caso de uso
2. Explicar el beneficio esperado
3. Proporcionar mockups si es posible

### 19.3 Contribuir al Código

```bash
# 1. Fork del repositorio
# 2. Crear branch
git checkout -b feature/nueva-funcionalidad

# 3. Commit de cambios
git commit -m "feat: agregar funcionalidad X"

# 4. Push y crear Pull Request
git push origin feature/nueva-funcionalidad
```

**Convención de commits:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan lógica)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

---

## 20. Licencia

Este proyecto es propiedad de [TU EMPRESA/NOMBRE].

**Uso del código:**
- ✅ Uso interno
- ✅ Modificaciones permitidas
- ❌ Redistribución sin autorización
- ❌ Uso comercial sin licencia

---

## 🎉 Fin de la Documentación

Esta documentación cubre todos los aspectos técnicos del frontend de **EcoWatt**. Para consultas específicas sobre el backend o la infraestructura, contacta al equipo de backend.

**Última actualización:** Diciembre 2025  
**Versión de la documentación:** 1.0  
**Mantenido por:** [Tu Nombre/Equipo]
