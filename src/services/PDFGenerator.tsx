// src/services/PDFGenerator.ts

import RNPrint from 'react-native-print';
import { Platform } from 'react-native';

// Importamos tipos necesarios
import { MonthlyReportData, TariffLevel } from './reportService'; 

interface PDFResult {
    success: boolean;
    path: string; // En Android no siempre retornamos path porque el usuario lo guarda manualmente
    error?: string;
}

// --- 2. LÓGICA DE AHORRO (Se mantiene igual) ---
const calculateSavingsData = (data: MonthlyReportData) => {
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
        message: `El consumo en tarifa Excedente representó <strong>$${excedenteLevel.subtotal_mxn.toFixed(2)}</strong> extra. ¡Intenta reducirlo!`
    };
};

// --- 3. PLANTILLA HTML (Tu diseño Verde Moderno) ---
const getReportHtml = (data: MonthlyReportData): string => {
    const savings = calculateSavingsData(data);
    const now = new Date();
    const generatedDate = now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    const tariffRows = data.cost_breakdown.tariff_levels.map((level) => {
        const isExcedente = level.level_name.includes("Excedente");
        const cleanName = level.level_name.replace(/\*\*/g, ''); 
        return `
        <tr class="${isExcedente ? 'excedente-row' : ''}">
            <td>${cleanName}</td>
            <td style="text-align: right;">${level.kwh_consumed.toFixed(2)}</td>
            <td style="text-align: right;">$${level.price_per_kwh.toFixed(2)}</td>
            <td style="text-align: right; font-weight: bold;">$${level.subtotal_mxn.toFixed(2)}</td>
        </tr>
    `}).join('');

    const alertList = data.alerts && data.alerts.length > 0 
        ? data.alerts.map(a => `<li class="alert-item"><strong>${a.title}:</strong> ${a.body}</li>`).join('')
        : '<li class="alert-item" style="background-color: #d1e7dd; color: #0f5132;">✅ Sin incidencias.</li>';

    return `
        <!DOCTYPE html>
        <html> 
        <head> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
            <style> 
                body { font-family: Helvetica, Arial, sans-serif; color: #333; padding: 0; margin: 0; } 
                .header { background-color: #008060; color: white; padding: 30px 20px; text-align: center; border-bottom: 5px solid #00FF7F; } 
                h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; } 
                .container { padding: 25px; max-width: 800px; margin: 0 auto; } 
                h2 { color: #008060; border-left: 5px solid #00FF7F; padding-left: 10px; margin-top: 25px; font-size: 18px; } 
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; } 
                th { background-color: #f0f2f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; } 
                td { border-bottom: 1px solid #eee; padding: 10px; } 
                .excedente-row td { background-color: #fff5f5; color: #c53030; font-weight: bold; } 
                .total-row td { font-weight: bold; background-color: #f9f9f9; } 
                .total-final { background-color: #d1e7dd; color: #0f5132; font-size: 16px; border-top: 2px solid #008060; } 
                .total-final td { padding: 15px 10px; font-weight: 800; } 
                .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); } 
                .big-num { font-size: 28px; font-weight: bold; color: #dc3545; display: block; margin-top: 5px; } 
                .savings-box { background-color: ${savings.hasSavings ? '#e6ffed' : '#f0f9ff'}; border: 1px solid ${savings.hasSavings ? '#28a745' : '#bde0fe'}; padding: 20px; border-radius: 8px; margin-top: 15px; } 
                .savings-amount { color: #dc3545; font-size: 32px; font-weight: bold; display: block; margin: 10px 0; } 
                .alert-item { background-color: #fff3cd; padding: 10px; margin-bottom: 5px; border-radius: 4px; font-size: 12px; list-style: none; border-left: 3px solid #ffc107; } 
                .footer { text-align: center; font-size: 10px; color: #999; margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; } 
            </style> 
        </head> 
        <body> 
            <div class="header"> 
                <h1>Estado de Cuenta</h1> 
                <p style="margin: 5px 0; opacity: 0.9;">${data.header.period_month}</p> 
                <p style="font-size: 14px;">${data.header.user_name}</p> 
                <p style="font-size: 10px; margin-top:0;">${data.header.user_email}</p>
            </div> 
            <div class="container"> 
                <div class="summary-box"> 
                    <span style="font-size: 12px; text-transform: uppercase; color: #666;">Total Estimado a Pagar</span> 
                    <span class="big-num">$${data.executive_summary.total_estimated_cost_mxn.toFixed(2)} MXN</span> 
                    <span style="font-size: 10px; color: #999;">Periodo: ${data.header.billing_cycle_start} - ${data.header.billing_cycle_end}</span>
                </div> 
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
                            <td style="text-align: right;">$${data.cost_breakdown.fixed_charge_mxn.toFixed(2)}</td> 
                        </tr> 
                        <tr class="total-final"> 
                            <td colspan="3" style="text-align: right;">TOTAL ESTIMADO</td> 
                            <td style="text-align: right;">$${data.cost_breakdown.total_cost_mxn.toFixed(2)}</td> 
                        </tr> 
                    </tbody> 
                </table> 
                <h2>Análisis de Ahorro</h2> 
                <div class="savings-box"> 
                    <strong style="color: #008060; font-size: 16px;">${savings.title}</strong> 
                    ${savings.hasSavings ? `<span class="savings-amount">$${savings.amount.toFixed(2)} MXN</span>` : '<br><br>'}
                    <p style="margin: 0; color: #155724;">${savings.message}</p> 
                </div> 
                <h2>Alertas y Avisos</h2> 
                <ul style="padding: 0;">${alertList}</ul> 
                <div class="footer">Generado el ${generatedDate}<br>Documento informativo generado por EcoWatt, no oficial ante CFE.</div> 
            </div> 
        </body> 
        </html>
    `;
};

// --- 4. FUNCIÓN EXPORTADA (USANDO REACT-NATIVE-PRINT) ---
export const generateEcoWattReport = async (reportData: MonthlyReportData): Promise<PDFResult> => {
    try {
        console.log("Iniciando impresión nativa...");
        const htmlContent = getReportHtml(reportData);
        
        // Esta función abre la interfaz nativa del sistema
        // Android: Abre "Vista previa de impresión". El usuario elige "Guardar como PDF" en el menú de impresoras.
        // iOS: Muestra el selector de impresora o guardar archivos.
        const jobName = `EcoWatt_Reporte_${new Date().toISOString().substring(0, 10)}`;

        await RNPrint.print({
            html: htmlContent,
            jobName: jobName
        });

        // NOTA: En Android, RNPrint no nos devuelve la ruta del archivo,
        // ya que el usuario es quien decide dónde guardarlo desde la UI del sistema.
        // Por eso retornamos success: true sin path específico.
        
        return { success: true, path: 'Guardado por el usuario' };

    } catch (error: any) {
        console.error("Error en impresión:", error);
        // Si el usuario cancela la impresión, cuenta como "error" en algunas versiones,
        // pero podemos manejarlo suavemente.
        return { success: false, path: '', error: error.message || 'Error al imprimir' };
    }
};