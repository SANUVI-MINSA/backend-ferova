import PDFDocument from "pdfkit";

export class PdfService {

    static generateMedicalRecordPdf(
        patient: any,
        medicalRecord: any
    ): Promise<Buffer> {

        return new Promise((resolve) => {

            const doc =
                new PDFDocument();

            const buffers: Buffer[] = [];

            doc.on("data", (chunk) =>
                buffers.push(chunk)
            );

            doc.on("end", () => {
                resolve(
                    Buffer.concat(
                        buffers
                    )
                );
            });

            doc.fontSize(18)
                .text(
                    "Medical Record Report"
                );

            doc.moveDown();

            doc.fontSize(12)
                .text(
                    `Patient: ${patient.name} ${patient.lastName}`
                );

            doc.text(
                `Gender: ${patient.gender}`
            );

            doc.text(
                `Status: ${patient.status}`
            );

            doc.moveDown();

            doc.text(
                `Weight: ${medicalRecord.weight} kg`
            );

            doc.text(
                `Height: ${medicalRecord.height} cm`
            );

            doc.text(
                `Hemoglobin Level: ${
                    medicalRecord.hemoglobinLevel ?? "Not registered"
                }`
            );

            doc.text(
                `Consult Reason: ${medicalRecord.motivoConsulta}`
            );

            doc.text(
                `Observations: ${medicalRecord.observaciones ?? "None"}`
            );

            doc.moveDown();

            doc.text("Symptoms:");

            medicalRecord.sintomas.forEach(
                (symptom: string) => {
                    doc.text(
                        `- ${symptom}`
                    );
                }
            );

            doc.moveDown();

            doc.text("Antecedents:");

            medicalRecord.antecedentes.forEach(
                (a: any) => {
                    doc.text(
                        `- ${a.type}: ${a.description}`
                    );
                }
            );

            doc.end();
        });
    }

    static generateHemoglobinReportPdf(
        medicalRecord: any
    ): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument();
            const buffers: Buffer[] = [];

            doc.on("data", (chunk) =>
                buffers.push(chunk)
            );

            doc.on("end", () => {
                resolve(
                    Buffer.concat(buffers)
                );
            });

            doc.fontSize(18)
                .text(
                    "Hemoglobin Controls Report"
                );

            doc.moveDown();

            const controls = medicalRecord.controls;

            if (!controls || controls.length === 0) {
                doc.text("No hemoglobin controls registered yet.");
                doc.end();
                return;
            }

            let total = 0;

            // ✅ Calcular primer y último control
            const firstControl = controls[0];
            const lastControl = controls[controls.length - 1];
            const evolution = lastControl.hemoglobinLevel - firstControl.hemoglobinLevel;

            // ✅ Formatear fecha para mejor visualización
            const formatDate = (date: any) => {
                if (!date) return 'N/A';
                try {
                    return new Date(date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                } catch {
                    return date;
                }
            };

            // Mostrar controles de hemoglobina
            controls.forEach((control: any) => {
                total += control.hemoglobinLevel;

                doc.fontSize(12);
                doc.text(`📅 Date: ${formatDate(control.date)}`, { continued: false });
                doc.text(`💉 Hemoglobin: ${control.hemoglobinLevel} g/dL`);
                doc.text(`📊 Status: ${control.anemiaStatus || 'N/A'}`);
                doc.moveDown(0.5);
            });

            const average = controls.length > 0 ? total / controls.length : 0;

            doc.moveDown();

            // ✅ Sección de estadísticas con resaltado de evolución
            doc.fontSize(14).text("Statistics Summary:", { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12);
            doc.text(`Total Controls: ${controls.length}`);
            doc.text(`Average Hemoglobin: ${average.toFixed(2)} g/dL`);

            // ✅ MOSTRAR EVOLUCIÓN CON COLORES Y SÍMBOLOS
            doc.moveDown(0.5);
            doc.fontSize(14).text("Evolution Analysis:", { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12);
            doc.text(`First Control: ${firstControl.hemoglobinLevel} g/dL (${formatDate(firstControl.date)})`);
            doc.text(`Last Control: ${lastControl.hemoglobinLevel} g/dL (${formatDate(lastControl.date)})`);

            // ✅ Calcular y mostrar evolución con color
            const evolutionText = evolution > 0
                ? `↑ Increased by +${evolution.toFixed(2)} g/dL`
                : evolution < 0
                    ? `↓ Decreased by ${evolution.toFixed(2)} g/dL`
                    : `→ Stable (No change)`;

            // Cambiar color según tendencia
            if (evolution > 0) {
                doc.fillColor('#00AA00')  // Verde para mejora
                    .text(`Evolution: ${evolutionText}`)
                    .fillColor('#000000');
            } else if (evolution < 0) {
                doc.fillColor('#FF0000')  // Rojo para empeoramiento
                    .text(`Evolution: ${evolutionText}`)
                    .fillColor('#000000');
            } else {
                doc.text(`Evolution: ${evolutionText}`);
            }

            // ✅ Agregar interpretación clínica
            doc.moveDown();
            doc.fontSize(10).fillColor('#666666');
            if (evolution > 0) {
                doc.text("✓ Positive trend: Hemoglobin levels are improving");
            } else if (evolution < 0) {
                doc.text("⚠ Negative trend: Hemoglobin levels are decreasing");
            } else {
                doc.text("→ Stable trend: No significant changes in hemoglobin levels");
            }

            doc.fillColor('#000000');
            doc.end();
        });
    }
}