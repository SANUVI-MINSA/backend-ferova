import {TreatmentCommandService} from "../../model/services/TreatmentCommandService";
import {TreatmentRepository} from "../../model/repositories/TreatmentRepository";
import {DailyDoseRepository} from "../../model/repositories/DailyDoseRepository";
import {PatientRepository} from "../../../patient-management/domain/repositories/PatientRepository";
import {AbandonTreatmentCommand} from "../../model/domain/commands/AbandonTreatmentCommand";
import {Promise} from "mongoose";
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

        // Persistir

        await this
            .treatmentRepository
            .update(
                treatment
            );

        // Responses

        return {
            message:
                "Treatment marked as abandoned successfully",
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

    async confirmDose(command: ConfirmDoseCommand): Promise<any> {

        // Validar si paciente existe
        const patient =
            await this.patientRepository.findById(command.patientId);

        if(!patient) {
            throw new Error(
                "Patient not found"
            )
        }

        // Validar madre dueña del paciente
        const patientData =
            patient.toPrimitives();

        if(
            patientData.motherId !==
            command.motherId
        ) {
            throw new Error(
                "Mother is not assigned to this patient"
            )
        }

        // Validar tratamiento activo

        const treatment =
            await this.treatmentRepository
                .findById(command.treatmentId);

        if(!treatment) {
            throw new Error(
                "Treatment not found"
            )
        }

        if (
            treatment.getStatus() !==
            TreatmentStatus.ACTIVE
        ) {
            throw new Error(
                "Treatment is not active"
            );
        }

        // Validar que tratamiento pertenezca al paciente

        if (
            treatment.getPatientId() !==
            command.patientId
        ) {
            throw new Error(
                "Treatment does not belong to this patient"
            );
        }

        // Buscar DailyDose

        const dose =
            await this
                .dailyDoseRepository
                .findById(
                    command.dailyDoseId
                );

        if (!dose) {
            throw new Error(
                "Daily dose not found"
            );
        }

        // Validar que pertenezca al tratamiento

        if (
            dose.getTreatmentId() !==
            command.treatmentId
        ) {
            throw new Error(
                "Dose does not belong to this treatment"
            );
        }

        // Validar que sea dosis de hoy

        const today =
            new Date();

        const doseDate =
            dose.getScheduledDate();

        const isToday =
            today.toDateString() ===
            doseDate.toDateString();

        if (!isToday) {
            throw new Error(
                "You can only confirm today's dose"
            );
        }

        // Confirmar dosis

        dose.confirm();

        // Actualizar adherencia

        treatment.updateAdherenceMetrics(
            true
        );

        // Recalcular riesgo

        const risk =
            treatment.getRiskScore();

        const currentScore =
            Math.max(
                0,
                risk.getScore() - 10
            );

        risk.updateScore(
            currentScore
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

        // Responses

        return {
            message:
                "Dose confirmed successfully",
            dose:
                dose.toPrimitives(),
            treatment:
                treatment.toPrimitives()
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

}