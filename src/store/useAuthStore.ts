import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importamos la función con el nombre correcto y las dependencias de servicio
import { initializeNotificationService } from '../services/notificationService'; 
import { logoutUser } from '../services/authService'; 

// --- Interfaz de AuthState ---
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  wifiSsid: string | null;
  wifiPassword: string | null;
  hasDevices: boolean; 

  login: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  setWifiCredentials: (ssid: string, password: string) => void; 
  setHasDevices: (status: boolean) => void; 
}

// --- Creación del Store ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      wifiSsid: null,
      wifiPassword: null,
      hasDevices: false, 

      login: (accessToken, refreshToken) => {
        set({
          isAuthenticated: true,
          token: accessToken,
          refreshToken,
        });
        
        // 🔥 CORRECCIÓN 1: Pasar el token a la función para que el servicio pueda
        // registrar el FCM Token en el backend.
        initializeNotificationService(accessToken); 
      },

      logout: async () => {
        const refreshToken = get().refreshToken;
        try {
          if (refreshToken) {
            await logoutUser(refreshToken);
          }
        } catch (error) {
          console.warn('Error al cerrar sesión en el servidor:', error);
        } finally {
          set({
            isAuthenticated: false,
            token: null,
            refreshToken: null,
            wifiSsid: null,
            wifiPassword: null,
            hasDevices: false, 
          });
        }
      },
      
      setWifiCredentials: (ssid, password) =>
        set({
          wifiSsid: ssid,
          wifiPassword: password,
        }),

      setHasDevices: (status) =>
        set({
          hasDevices: status,
        }),

    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      
      onRehydrateStorage: () => (state) => {
        // 🔥 CORRECCIÓN 2: Verificar que el token exista antes de intentar inicializar
        // las notificaciones al restaurar la sesión.
        if (state?.isAuthenticated && state?.token) {
          console.log('Usuario ya autenticado, inicializando notificaciones...');
          initializeNotificationService(state.token);
        }
      },
    }
  )
);