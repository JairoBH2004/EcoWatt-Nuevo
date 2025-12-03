// src/services/reportService.ts
const API_BASE_URL = 'https://core-cloud.dev';

// --- Tipos de la Respuesta de Reporte (Se mantienen) ---
export type DailyConsumptionPoint = { date: string; kwh: number; };
export type TariffLevel = { level_name: string; kwh_consumed: number; price_per_kwh: number; subtotal_mxn: number; }; 

export interface MonthlyReportData {
    header: any; 
    executive_summary: any;
    consumption_details: { daily_consumption: DailyConsumptionPoint[]; average_daily_consumption: number; highest_consumption_day: DailyConsumptionPoint; lowest_consumption_day: DailyConsumptionPoint; };
    cost_breakdown: { applied_tariff: string; tariff_levels: TariffLevel[]; fixed_charge_mxn: number; total_cost_mxn: number; };
    environmental_impact: any;
    alerts: any[];
    recommendations: any[];
    generated_at: string;
}

/**
 * Endpoint: POST /api/v1/reports/monthly
 * Genera un reporte mensual para el mes y año especificados, 
 * manejando caché o generación en tiempo real según el backend.
 */
export const getMonthlyReport = async (
    token: string, 
    month: number, // 1 a 12
    year: number
): Promise<MonthlyReportData> => {
    try {
        console.log(`Solicitando reporte para mes ${month} y año ${year}`);
        const response = await fetch(`${API_BASE_URL}/api/v1/reports/monthly`, {
            method: 'POST', // <-- MÉTODO POST
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ month, year }), // <-- CUERPO CON MES Y AÑO
        });

        if (!response.ok) {
            console.error("Error al obtener reporte:", response.status);
            throw new Error(`Error ${response.status}: No se pudo obtener el reporte.`);
        }
        
        const data = await response.json();
        // Log para depuración, verifica que los datos no sean cero aquí
        console.log("Reporte recibido:", JSON.stringify(data.executive_summary, null, 2)); 

        return data as MonthlyReportData;
    } catch (error) {
        console.error('Error de red al obtener reporte:', error);
        throw new Error('Error de red al obtener el reporte.');
    }
};

// Dejamos la función original comentada si la necesitas en otro lugar, 
// pero usaremos la nueva `getMonthlyReport` en StatsScreen.
/*
export const getCurrentMonthlyReport = async (token: string): Promise<MonthlyReportData> => {
    // Implementación original GET /api/v1/reports/monthly/current
};
*/