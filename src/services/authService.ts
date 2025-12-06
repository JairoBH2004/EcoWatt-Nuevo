// src/services/authService.ts

// 🔥 NUEVA IMPORTACIÓN: Necesaria para obtener/establecer tokens globalmente
import { useAuthStore } from '../store/useAuthStore'; 

const API_BASE_URL = 'https://core-cloud.dev';

// ========================================
// HELPER PARA MANEJAR ERRORES
// ========================================
const handleApiError = async (response: Response) => {
    // Si el status es 401, lanzamos un error que el interceptor puede identificar
    if (response.status === 401) {
        // Lanzamos un error que contiene el status para identificarlo en el interceptor
        throw new Error(`Unauthorized ${response.status}`); 
    }
    
    // Lógica original para parsear errores 4xx y 5xx
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

// ========================================
// INTERFACES (Cuerpo del archivo, sin cambios)
// ========================================

interface UserRegistrationData {
    user_name: string;
    user_email: string;
    user_password: string;
    user_trf_rate: string;
    user_billing_day: number;
}

interface LoginCredentials {
    user_email: string;
    user_password: string;
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface UserProfile {
    user_id: number;
    user_name: string;
    user_email: string;
    user_trf_rate: string;
    user_billing_day: number;
}

interface UpdateUserData {
    user_name?: string;
    user_email?: string;
    user_billing_day?: number;
}

interface ResetPasswordData {
    token: string;
    new_password: string;
}

interface CarbonFootprint {
    co2_emitted_kg: number;
    equivalent_trees_absorption_per_year: number;
}

export interface DashboardSummary {
    kwh_consumed_cycle: number;
    estimated_cost_mxn: number;
    billing_cycle_start: string;
    billing_cycle_end: string;
    days_in_cycle: number;
    current_tariff: string;
    carbon_footprint: CarbonFootprint;
    latest_recommendation: string;
}

export interface Device {
    dev_id: number;
    dev_user_id: number;
    dev_hardware_id: string;
    dev_name: string;
    dev_status: boolean;
    dev_brand: string;
    dev_model: string;
}

interface DeviceRegistrationData {
    name: string;
    mac: string;
}

export interface HistoryDataPoint {
    timestamp: string;
    value: number;
}

export interface HistoryGraphResponse {
    labels: string[]; 
    watts: number[]; 
    
    period?: string; 
    unit?: string;
    data_points?: HistoryDataPoint[]; 
}

interface FcmRegistrationData {
    fcm_token: string;
    device_name?: string;
    platform?: string;
}

// ========================================
// 🔥 NUEVAS FUNCIONES CLAVE DE REFRESH
// ========================================

// 1. Función para llamar al endpoint de refresh (Pública para ser usada por el interceptor)
export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
        throw new Error('Refresh Failed: Token no válido o expirado.');
    }

    return await response.json() as LoginResponse;
};

/**
 * 2. Helper que ejecuta la petición y maneja el refresco de token.
 * Recibe el token, el endpoint y las opciones de fetch.
 */
async function fetchWithRefresh(endpoint: string, options: RequestInit): Promise<Response> {
    const store = useAuthStore.getState();

    // 1. Ejecutar el fetch con el token actual (Access Token)
    let response = await fetch(endpoint, options);

    // 2. Si el token expiró (401) y tenemos un Refresh Token
    if (response.status === 401 && store.refreshToken) {
        console.log('⚠️ Access Token expirado. Intentando refrescar...');
        
        try {
            // 3. Refrescar tokens
            const newTokens = await refreshAccessToken(store.refreshToken);
            
            // 4. Actualizar el estado global
            store.login(newTokens.access_token, newTokens.refresh_token);

            // 5. Actualizar los headers para el reintento
            const newHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${newTokens.access_token}`,
            };
            
            // 6. Reintentar la llamada API con el nuevo Access Token
            console.log('✅ Token renovado. Reintentando la llamada original...');
            response = await fetch(endpoint, { ...options, headers: newHeaders });

        } catch (error) {
            // Si el refresh falla (e.g., Refresh Token también expiró)
            console.error('❌ Falló el refresco. Cerrando sesión.');
            store.logout();
            throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
        }
    }
    
    return response;
}

// ========================================
// AUTENTICACIÓN Y USUARIO (MODIFICADO)
// ========================================

// registerUser y loginUser (Públicas) permanecen IGUAL.

export const registerUser = async (userData: UserRegistrationData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al registrar usuario.');
    }
};

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) await handleApiError(response);
        return await response.json() as LoginResponse;
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al iniciar sesión.');
    }
};

export const logoutUser = async (refreshToken: string) => {
    // Permanece IGUAL.
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) console.error('El logout en el servidor falló, pero se procederá localmente.');
    } catch (error) {
        console.error('Error de red al intentar cerrar sesión:', error);
    }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    // Permanece IGUAL.
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email }),
        });
        if (!response.ok && response.status >= 400) {
            await handleApiError(response);
        }
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al solicitar reseteo de contraseña.');
    }
};

export const resetPassword = async (resetData: ResetPasswordData): Promise<void> => {
    // Permanece IGUAL.
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resetData),
        });

        if (!response.ok && response.status >= 400) {
            await handleApiError(response);
        }
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al restablecer la contraseña.');
    }
};

export const getUserProfile = async (token: string): Promise<UserProfile> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/users/me`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401'); // Propagar 401 para que HomeScreen pueda manejar el logout
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al obtener el perfil.');
    }
};

export const updateUserProfile = async (token: string, userData: UpdateUserData): Promise<UserProfile> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string).
    try {
        const body = JSON.stringify(Object.fromEntries(
            Object.entries(userData).filter(([_, v]) => v !== undefined)
        ));

        const endpoint = `${API_BASE_URL}/api/v1/users/me`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: body,
        });

        if (!response.ok) {
            await handleApiError(response);
        }
        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al actualizar el perfil.');
    }
};

// ========================================
// DASHBOARD
// ========================================

export const getDashboardSummary = async (token: string): Promise<DashboardSummary> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/dashboard/summary`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al obtener los datos del dashboard.');
    }
};

// ========================================
// HISTORIAL
// ========================================

export const getHistoryGraph = async (
    token: string,
    period: 'daily' | 'weekly' | 'monthly'
): Promise<HistoryGraphResponse> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string, ...).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/history/graph?period=${period}`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al obtener la gráfica.');
    }
};

export const getLast7DaysHistory = async (token: string): Promise<HistoryGraphResponse> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/history/last7days`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al obtener historial de 7 días.');
    }
};

// ========================================
// DISPOSITIVOS
// ========================================

/**
 * Obtiene todos los dispositivos del usuario
 */
export const getDevices = async (token: string): Promise<Device[]> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/devices/`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al obtener los dispositivos.');
    }
};

/**
 * Registra un nuevo dispositivo Shelly
 */
export const registerDevice = async (
    token: string, 
    deviceData: DeviceRegistrationData
): Promise<Device> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string, ...).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/devices/`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                dev_hardware_id: deviceData.mac.toUpperCase(),
                dev_name: deviceData.name,
            }),
        });

        if (!response.ok) {
            // Mantenemos la lógica de manejo de errores específica
            if (response.status === 409) {
                throw new Error('Este dispositivo ya está registrado en tu cuenta');
            }
            if (response.status === 422) {
                throw new Error('MAC inválida o datos incorrectos');
            }
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al registrar el dispositivo.');
    }
};

/**
 * Actualiza el nombre de un dispositivo
 */
export const updateDevice = async (
    token: string,
    deviceId: number,
    newName: string
): Promise<Device> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string, ...).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/devices/${deviceId}`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ dev_name: newName }),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al actualizar dispositivo.');
    }
};

/**
 * Elimina un dispositivo
 */
export const deleteDevice = async (token: string, deviceId: number): Promise<void> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/devices/${deviceId}`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al eliminar dispositivo.');
    }
};

// ========================================
// NOTIFICACIONES FCM
// ========================================

/**
 * Registra el token FCM para recibir notificaciones push
 */
export const registerFcmToken = async (
    token: string,
    fcmData: FcmRegistrationData
): Promise<void> => {
    // 🔥 MODIFICADO: Usa fetchWithRefresh. Mantiene la firma (token: string, ...).
    try {
        const endpoint = `${API_BASE_URL}/api/v1/fcm/register`;
        const response = await fetchWithRefresh(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                fcm_token: fcmData.fcm_token,
                device_name: fcmData.device_name || null,
                platform: fcmData.platform || null,
            }),
        });

        if (!response.ok) {
            await handleApiError(response);
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw new Error('401');
        }
        if (error instanceof Error) throw error;
        throw new Error('Error desconocido al registrar el token FCM.');
    }
};