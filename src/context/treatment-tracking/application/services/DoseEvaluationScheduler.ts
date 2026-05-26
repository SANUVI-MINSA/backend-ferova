import cron from 'node-cron';
import { DailyDoseRepository } from "../../model/repositories/DailyDoseRepository";
import { TreatmentRepository } from "../../model/repositories/TreatmentRepository";
import { DoseStatus } from "../../model/domain/value-objects/enum/DoseStatus";
import { DOSE_CONFIG } from "../../../../shared/infrastructure/config/dose.config";
import { eventPublisher } from "../../../../shared/infrastructure/events/EventPublisher";

export class DoseEvaluationScheduler {

    constructor(
        private dailyDoseRepository: DailyDoseRepository,
        private treatmentRepository: TreatmentRepository
    ) {}

    /**
     * Inicia el scheduler que evalúa dosis pendientes cada minuto
     */
    startScheduler(): void {
        cron.schedule('* * * * *', async () => {
            console.log('[DoseEvaluation] Evaluando dosis pendientes...', new Date().toISOString());

            try {
                await this.evaluatePendingDoses();
            } catch (error) {
                console.error('[DoseEvaluation] Error:', error);
            }
        });

        const thresholdHours = DOSE_CONFIG.getOmissionThresholdHours();
        console.log(`[DoseEvaluation] Scheduler iniciado. Umbral: ${thresholdHours} horas (${thresholdHours * 60} minutos)`);
    }

    /**
     * Evalúa todas las dosis pendientes que superan el umbral
     */
    async evaluatePendingDoses(): Promise<void> {
        const thresholdHours = DOSE_CONFIG.getOmissionThresholdHours();

        const pendingDoses = await this.dailyDoseRepository.findPendingOlderThanHours(thresholdHours);

        if (pendingDoses.length === 0) {
            console.log('[DoseEvaluation] No hay dosis pendientes que superen el umbral');
            return;
        }

        console.log(`[DoseEvaluation] Encontradas ${pendingDoses.length} dosis para evaluar`);

        const treatmentMap = new Map<string, { doses: any[], treatment: any }>();

        for (const dose of pendingDoses) {
            const treatmentId = dose.getTreatmentId();

            if (!treatmentMap.has(treatmentId)) {
                const treatment = await this.treatmentRepository.findById(treatmentId);
                if (treatment) {
                    treatmentMap.set(treatmentId, { doses: [], treatment });
                }
            }

            if (treatmentMap.has(treatmentId)) {
                treatmentMap.get(treatmentId)!.doses.push(dose);
            }
        }

        for (const [treatmentId, { doses, treatment }] of treatmentMap) {
            console.log(`[DoseEvaluation] Procesando tratamiento ${treatmentId}, ${doses.length} dosis`);

            for (const dose of doses) {
                if (dose.getStatus() === DoseStatus.PENDING) {
                    const hoursOverdue = dose.calculateHoursWithoutConfirmation();

                    console.log(`[DoseEvaluation] Omitiendo dosis ${dose.getId()} con ${hoursOverdue} horas de retraso`);

                    // Marcar como omitida
                    dose.markAsOmitted();
                    await this.dailyDoseRepository.update(dose);

                    // 🔥 PUBLICAR EVENTO PARA ACHIEVEMENTS
                    await eventPublisher.publish("DailyDoseOmitted", {
                        treatmentId: treatment.getId(),
                        dailyDoseId: dose.getId()
                    });

                    // Actualizar métricas del tratamiento
                    treatment.updateAdherenceMetrics(false);

                    // Aumentar riesgo +20 puntos
                    const risk = treatment.getRiskScore();
                    const newScore = Math.min(100, risk.getScore() + 20);
                    risk.updateScore(newScore);
                    treatment.updateRiskScore(risk);
                }
            }

            await this.treatmentRepository.update(treatment);
        }

        console.log(`[DoseEvaluation] Procesamiento completado. ${pendingDoses.length} dosis omitidas`);
    }

    /**
     * Ejecuta una evaluación única (para pruebas)
     */
    async evaluateOnce(): Promise<any> {
        await this.evaluatePendingDoses();
        return { message: "Evaluación manual completada" };
    }
}