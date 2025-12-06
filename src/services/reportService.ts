// src/services/reportService.ts
const API_BASE_URL = 'https://core-cloud.dev';

// --- Tipos de la Respuesta de Reporte ---
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
 * Genera un reporte para meses PASADOS (Histórico / Base de Datos)
 */
export const getMonthlyReport = async (
    token: string, 
    month: number, // 1 a 12
    year: number
): Promise<MonthlyReportData> => {
    try {
        console.log(`Solicitando reporte histórico para mes ${month} y año ${year}`);
        const response = await fetch(`${API_BASE_URL}/api/v1/reports/monthly`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ month, year }),
        });

        if (!response.ok) {
            console.error("Error al obtener reporte histórico:", response.status);
            throw new Error(`Error ${response.status}: No se pudo obtener el reporte.`);
        }
        
        const data = await response.json();
        return data as MonthlyReportData;
    } catch (error) {
        console.error('Error de red al obtener reporte:', error);
        throw new Error('Error de red al obtener el reporte.');
    }
};

/**
 * Endpoint: GET /api/v1/reports/monthly/current
 * Genera el reporte del mes ACTUAL (Tiempo Real / Redis)
 */
export const getCurrentMonthlyReport = async (token: string): Promise<MonthlyReportData> => {
    try {
        console.log("Solicitando reporte del mes ACTUAL (Tiempo real)...");
        const response = await fetch(`${API_BASE_URL}/api/v1/reports/monthly/current`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            console.error("Error al obtener reporte actual:", response.status);
            throw new Error(`Error ${response.status}: No se pudo obtener el reporte actual.`);
        }
        
        const data = await response.json();
        console.log("Reporte actual recibido:", JSON.stringify(data.executive_summary, null, 2));
        
        return data as MonthlyReportData;
    } catch (error) {
        console.error('Error de red al obtener reporte actual:', error);
        throw new Error('Error de red al obtener el reporte actual.');
    }
};