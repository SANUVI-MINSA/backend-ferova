import {TreatmentCommandService} from "../../model/services/TreatmentCommandService";
import {TreatmentRepository} from "../../model/repositories/TreatmentRepository";
import {DailyDoseRepository} from "../../model/repositories/DailyDoseRepository";
import {PatientRepository} from "../../../patient-management/domain/repositories/PatientRepository";
import {AbandonTreatmentCommand} from "../../model/domain/commands/AbandonTreatmentCommand";
import {CompleteTreatmentCommand} from "../../model/domain/commands/CompleteTreatmentCommand";
import {ConfirmDoseCommand} from "../../model/domain/commands/ConfirmDoseCommand";
import {EvaluateMissedDoseCommand} from "../../model/domain/commands/EvaluateMissedDoseCommand";
import {StartTreatmentCommand} from "../../model/domain/commands/StartTreatmentCommand";
import {RiskScore} from "../../model/domain/entities/RiskScore";
import {randomUUID} from "node:crypto";
import {RiskLevel} from "../../model/domain/value-objects/enum/RiskLevel";
import {Treatment} from "../../model/domain/aggregates/Treatment";
import {TreatmentStatus} from "../../model/domain/value-objects/enum/TreatementStatus";
import {DailyDose} from "../../model/domain/entities/DailyDose";
import {DoseStatus} from "../../model/domain/value-objects/enum/DoseStatus";

export class TreatmentCommandServiceImpl
    implements TreatmentCommandService {

    constructor(
        private treatmentRepository:
        TreatmentRepository,

        private dailyDoseRepository:
        DailyDoseRepository,

        private patientRepository:
        PatientRepository
    ) {}

    async abandonTreatment(command: AbandonTreatmentCommand): Promise<any> {
        // Buscar tratamiento

        const treatment =
            await this
                .treatmentRepository
                .findById(
                    command.treatmentId
                );

        if (!treatment) {
            throw new Error(
                "Treatment not found"
            );
        }

        // Registrar abandono

        treatment.abandonTreatment(
            command.nurseId,
            command.observation
        );

        await this.deleteAllDosesForTreatment(treatment.getId());

        // Persistir

        await this
            .treatmentRepository
            .update(
                treatment
            );

        // Responses

        return {
            message: "Treatment marked as abandoned successfully. All associated doses have been removed.",
            treatment:
                treatment.toPrimitives()
        };
    }

    async completeTreatment(command: CompleteTreatmentCommand): Promise<any> {
        // Buscar tratamiento
        const treatment =
            await this
                .treatmentRepository
                .findById(
                    command.treatmentId
                );

        if (!treatment) {
            throw new Error(
                "Treatment not found"
            );
        }

        // Completar tratamiento

        treatment.completeTreatment(
            command.nurseId,
            command.observation
        );

        // Persistir

        await this
            .treatmentRepository
            .update(
                treatment
            );

        // Responses

        return {
            message:
                "Treatment completed successfully",
            treatment:
                treatment.toPrimitives()
        };
    }

    // TreatmentCommandServiceImpl.ts - confirmDose()
    async confirmDose(command: ConfirmDoseCommand): Promise<any> {

        // 1. Validar paciente existe
        const patient = await this.patientRepository.findById(command.patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }

        // 2. Validar madre (vs token)
        const patientData = patient.toPrimitives();
        if (patientData.motherId !== command.motherId) {
            throw new Error("Mother is not assigned to this patient");
        }

        // 3. Buscar tratamiento activo
        const treatment = await this.treatmentRepository.findActiveByPatientId(command.patientId);
        if (!treatment) {
            throw new Error("Patient does not have an active treatment");
        }

        if (treatment.getStatus() !== TreatmentStatus.ACTIVE) {
            throw new Error("Treatment is not active");
        }

        // 4. Buscar dosis PENDIENTE de hoy
        const todayDose = await this.dailyDoseRepository.findTodayDose(treatment.getId());
        if (!todayDose) {
            throw new Error("No pending dose found for today");
        }

        if (todayDose.getStatus() !== DoseStatus.PENDING) {
            throw new Error("Today's dose is already confirmed or omitted");
        }

        // 5. Confirmar dosis
        todayDose.confirm();

        // 6. Actualizar adherencia
        treatment.updateAdherenceMetrics(true);

        // 7. Recalcular riesgo (baja 10 puntos)
        const risk = treatment.getRiskScore();
        const currentScore = Math.max(0, risk.getScore() - 10);
        risk.updateScore(currentScore);
        treatment.updateRiskScore(risk);

        // 8. Persistir
        await this.dailyDoseRepository.update(todayDose);
        await this.treatmentRepository.update(treatment);

        // 9. Response
        return {
            message: "Dose confirmed successfully",
            dose: todayDose.toPrimitives(),
            treatment: treatment.toPrimitives()
        };
    }

    async evaluateMissedDose(command: EvaluateMissedDoseCommand): Promise<any> {
        // Buscar dosis
        const dose =
            await this.dailyDoseRepository.findById(command.dailyDoseId);

        if(!dose) {
            throw new Error(
                "Daily dose not found"
            )
        }

        // Solo evaluar pendientes

        if(
            dose.getStatus() !==
            DoseStatus.PENDING
        ) {
            return {
                message:
                    "Dose already processed"
            }
        }

        // Calcular horas sin confirmacion
        const hoursWithoutConfirmation =
            dose.calculateHoursWithoutConfirmation();

        // Regla critica -> >=72h
        if (
            hoursWithoutConfirmation < 72
        ) {
            return {
                message:
                    "Dose still within allowed confirmation window",
                hoursWithoutConfirmation
            };
        }

        // Marcar omitida

        dose.markAsOmitted();

        // Buscar tratamiento
        const treatment =
            await this
                .treatmentRepository
                .findById(
                    dose.getTreatmentId()
                );

        if (!treatment) {
            throw new Error(
                "Treatment not found"
            );
        }

        // Actualizar adherencia
        treatment.updateAdherenceMetrics(
            false
        );

        // Subir riesgp

        const risk =
            treatment.getRiskScore();

        const newScore =
            Math.min(
                100,
                risk.getScore() + 20
            );

        risk.updateScore(
            newScore
        );

        treatment.updateRiskScore(
            risk
        );

        // Persistir

        await this
            .dailyDoseRepository
            .update(dose);

        await this
            .treatmentRepository
            .update(treatment);

        // Response

        return {
            message:
                "Missed dose evaluated successfully",
            hoursWithoutConfirmation,
            dose:
                dose.toPrimitives(),
            treatment:
                treatment.toPrimitives()
        };
    }


    async startTreatment(command: StartTreatmentCommand): Promise<any> {
        // Validar paciente

        const patient =
            await this
                .patientRepository
                .findById(
                    command.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        // Validar Tratamiento activo existente

        const activeTreatment =
            await this
                .treatmentRepository
                .findActiveByPatientId(
                    command.patientId
                );

        if (activeTreatment) {
            throw new Error(
                "Patient already has an active treatment"
            );
        }

        // Fechas

        const startDate =
            new Date();

        const endDate =
            new Date();

        endDate.setDate(
            endDate.getDate() +
            command.durationDays
        );


        // Risk Inicial

        const initialRisk =
            new RiskScore(
                randomUUID(),
                10,
                RiskLevel.LOW,
                new Date()
            )

        // Crear Treatment

        const treatment =
            new Treatment(
                randomUUID(),
                command.patientId,
                command.nurseId,
                command.supplementName,
                command.quantity,
                command.dosingHours,
                command.durationDays,
                startDate,
                endDate,
                TreatmentStatus.ACTIVE,
                100,
                0,
                0,
                0,
                null,
                null,
                initialRisk
            );

        // Generar Daily Doses automaticamente
        const doses: DailyDose[] = [];

        for (let i=0; i < command.durationDays; i++) {
            const scheduledDate =
                new Date(startDate);

            scheduledDate.setDate(
                startDate.getDate() + i
            );

            doses.push(
                new DailyDose(
                    randomUUID(),
                    treatment.getId(),
                    scheduledDate,
                    null,
                    DoseStatus.PENDING
                )
            );
        }

        await this
            .treatmentRepository
            .save(treatment);

        await this
            .dailyDoseRepository
            .saveMany(doses);

        return {
            message:
                "Treatment started successfully",
            treatment:
                treatment.toPrimitives(),
            totalGeneratedDoses:
            doses.length
        };
    }

    // Solo para pruebas - forzar omision de una dosis
    async forceOmitDoseForTesting(dailyDoseId: string): Promise<any> {

        if (process.env.NODE_ENV === 'production') {
            throw new Error("Force omit endpoint is only available in development environment");
        }

        const dose = await this.dailyDoseRepository.findById(dailyDoseId);
        if (!dose) {
            throw new Error("Daily dose not found");
        }

        if (dose.getStatus() !== DoseStatus.PENDING) {
            throw new Error("Only pending doses can be omitted");
        }

        // Validar que la fecha ya pasó (no es futuro)
        const now = new Date();
        const scheduledDate = dose.getScheduledDate();

        if (scheduledDate > now) {
            throw new Error("Cannot omit a future dose. Wait until the scheduled date has passed.");
        }

        dose.markAsOmitted();


        // Buscar tratamiento
        const treatment = await this.treatmentRepository.findById(dose.getTreatmentId());
        if (!treatment) {
            throw new Error("Treatment not found");
        }

        // Actualizar adherencia (false = omitida)
        treatment.updateAdherenceMetrics(false);

        // Subir riesgo +20
        const risk = treatment.getRiskScore();
        const newScore = Math.min(100, risk.getScore() + 20);
        risk.updateScore(newScore);
        treatment.updateRiskScore(risk);

        // Persistir
        await this.dailyDoseRepository.update(dose);
        await this.treatmentRepository.update(treatment);

        return {
            message: "Dose force-omitted for testing",
            dose: dose.toPrimitives(),
            treatment: treatment.toPrimitives()
        };
    }

    /**
     * Elimina todas las dosis asociadas a un tratamiento
     *
     */
    private async deleteAllDosesForTreatment(treatmentId: string): Promise<void> {
        const allDoses = await this.dailyDoseRepository.findByTreatmentId(treatmentId);

        if (allDoses.length === 0) {
            console.log(`[abandonTreatment] No doses to delete for treatment ${treatmentId}`);
            return
        }

        const doseIds = allDoses.map(dose => dose.getId());

        console.log(`[abandonTreatment] Deleting ${doseIds.length} doses (PENDING, CONFIRMED, OMITTED) for abandoned treatment ${treatmentId}`);

        await this.dailyDoseRepository.deleteMany(doseIds);

    }
}