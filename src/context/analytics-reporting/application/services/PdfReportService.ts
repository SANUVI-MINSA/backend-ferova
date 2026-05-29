import { DashboardSummaryResponseDto } from "../dto/DashboardSummaryResponseDto";
import { FacilityAnalyticsItemDto } from "../dto/FacilityAnalyticsItemDto";
import PDFDocument from 'pdfkit';

export class PdfReportService {

    async generateFacilitiesReport(
        summary: DashboardSummaryResponseDto,
        facilities: FacilityAnalyticsItemDto[]
    ): Promise<Buffer> {
        return new Promise((resolve) => {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({ margin: 50 });

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Título
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('Reporte de Postas Médicas', { align: 'center' });
            doc.moveDown();

            // Fecha
            doc.fontSize(10)
                .font('Helvetica')
                .text(`Generado: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            // Resumen Global
            doc.fontSize(16)
                .font('Helvetica-Bold')
                .text('Resumen Global', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12)
                .font('Helvetica');

            // Tabla de resumen
            const summaryStartY = doc.y;
            doc.text(`Total de Postas Activas:`, 50, summaryStartY);
            doc.text(`${summary.totalActiveFacilities}`, 250, summaryStartY);

            doc.text(`Postas Críticas (Alto Riesgo):`, 50, summaryStartY + 20);
            doc.text(`${summary.totalCriticalFacilities}`, 250, summaryStartY + 20);

            doc.text(`Adherencia Global:`, 50, summaryStartY + 40);
            doc.text(`${summary.globalAdherenceRate}%`, 250, summaryStartY + 40);

            doc.moveDown(3);

            // Lista de postas
            doc.fontSize(16)
                .font('Helvetica-Bold')
                .text('Detalle de Postas', { underline: true });
            doc.moveDown(0.5);

            // Cabeceras de tabla
            const tableTop = doc.y;
            const colPositions = [50, 130, 280, 380, 470];

            doc.fontSize(10)
                .font('Helvetica-Bold');

            doc.text('N°', colPositions[0], tableTop);
            doc.text('Posta Médica', colPositions[1], tableTop);
            doc.text('Distrito', colPositions[2], tableTop);
            doc.text('Adherencia', colPositions[3], tableTop);
            doc.text('Riesgo', colPositions[4], tableTop);

            // Línea separadora
            doc.moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();

            doc.font('Helvetica');
            let currentY = tableTop + 25;

            for (let i = 0; i < facilities.length; i++) {
                const f = facilities[i];
                const rowNum = i + 1;

                // Color según nivel de riesgo
                if (f.riskLevel === 'HIGH') {
                    doc.fillColor('#dc2626'); // Rojo
                } else if (f.riskLevel === 'MEDIUM') {
                    doc.fillColor('#f59e0b'); // Naranja
                } else {
                    doc.fillColor('#10b981'); // Verde
                }

                doc.text(rowNum.toString(), colPositions[0], currentY);
                doc.text(f.facilityName.length > 20 ? f.facilityName.substring(0, 18) + '...' : f.facilityName, colPositions[1], currentY);
                doc.text(f.districtName.length > 18 ? f.districtName.substring(0, 16) + '...' : f.districtName, colPositions[2], currentY);
                doc.text(`${f.adherenceRate}%`, colPositions[3], currentY);
                doc.text(f.riskLevel, colPositions[4], currentY);

                currentY += 20;

                // Reset color
                doc.fillColor('#000000');

                // Nueva página si es necesario
                if (currentY > 700 && i < facilities.length - 1) {
                    doc.addPage();
                    currentY = 50;
                }
            }

            // Footer
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .fillColor('#666666')
                    .text(
                        `Página ${i + 1} de ${pageCount} - Reporte de Postas Médicas`,
                        50,
                        750,
                        { align: 'center' }
                    );
            }

            doc.fillColor('#000000');
            doc.end();
        });
    }
}