import {TreatmentQueryService} from "../../model/services/TreatmentQueryService";
import {TreatmentRepository} from "../../model/repositories/TreatmentRepository";
import {DailyDoseRepository} from "../../model/repositories/DailyDoseRepository";
import {PatientRepository} from "../../../patient-management/domain/repositories/PatientRepository";
import {GetPatientDoseHistoryQuery} from "../../model/domain/queries/GetPatientDoseHistoryQuery";
import {GetPatientTreatmentDetailQuery} from "../../model/domain/queries/GetPatientTreatmentDetailQuery";
import {GetPatientsByRiskLevelQuery} from "../../model/domain/queries/GetPatientsByRiskLevelQuery";
import {GetPendingPatientsByNurseQuery} from "../../model/domain/queries/GetPendingPatientsByNurseQuery";
import {GetRiskLevelOverviewQuery} from "../../model/domain/queries/GetRiskLevelOverviewQuery";
import {GetTodayDoseQuery} from "../../model/domain/queries/GetTodayDoseQuery";
import {GetTreatmentDetailsQuery} from "../../model/domain/queries/GetTreatmentDetailsQuery";
import {GetTreatmentsByNurseQuery} from "../../model/domain/queries/GetTreatmentsByNurseQuery";
import {TreatmentStatus} from "../../model/domain/value-objects/enum/TreatementStatus";
import {RiskLevel} from "../../model/domain/value-objects/enum/RiskLevel";

export class TreatmentQueryServiceImpl
    implements TreatmentQueryService {

    constructor(
        private treatmentRepository:
        TreatmentRepository,
        private dailyDoseRepository:
        DailyDoseRepository,
        private patientRepository:
        PatientRepository
    ) {
    }

    async getPatientDoseHistory(query: GetPatientDoseHistoryQuery): Promise<any> {
        // Validar paciente
        const patient =
            await this
                .patientRepository
                .findById(
                    query.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        // Buscar tratamiento
        const treatment =
            await this
                .treatmentRepository
                .findActiveByPatientId(
                    query.patientId
                );

        if (!treatment) {
            throw new Error(
                "Patient does not have an active treatment"
            );
        }

        // Obtener dosis
        const doses =
            await this
                .dailyDoseRepository
                .findByTreatmentId(
                    treatment.getId()
                );

        // Filtrar solo dosis CONFIRMED y OMITTED (excluir PENDING)
        const confirmedAndOmittedDoses =
            doses.filter(
                dose =>
                    dose.getStatus() === "CONFIRMED" ||
                    dose.getStatus() === "OMITTED"
            );

        // Ordenar por fecha descendente
        const sortedDoses =
            confirmedAndOmittedDoses.sort(
                (a, b) =>
                    b.getScheduledDate().getTime() -
                    a.getScheduledDate().getTime()
            );

        // Obtener info paciente
        const patientData =
            patient.toPrimitives();

        const treatmentData =
            treatment.toPrimitives();

        // Response
        return {
            patientId:
            patientData.id,

            patientName:
                `${patientData.name} ${patientData.lastName}`,

            supplementName:
            treatmentData.supplement,

            quantity:
            treatmentData.quantity,

            dosingHours:
            treatmentData.dosingHours,

            // Mostrar solo dosis confirmadas y omitidas
            doses:
                sortedDoses.map(
                    dose => ({
                        ...dose.toPrimitives(),
                        hoursWithoutConfirmation:
                            dose.calculateHoursWithoutConfirmation()
                    })
                ),
        };
    }

    async getPatientTreatmentDetail(query: GetPatientTreatmentDetailQuery): Promise<any> {
        // Validar paciente
        const patient =
            await this.patientRepository.findById(
                query.patientId
            );

        if(!patient) {
            throw new Error("Patient not found")
        }

        // Buscar tratamiento activo

        const treatment =
            await this
                .treatmentRepository
                .findActiveByPatientId(
                    query.patientId
                );

        if (!treatment) {
            throw new Error(
                "Patient does not have an active treatment"
            );
        }

        // Obtener datos

        const patientData =
            patient.toPrimitives();

        const treatmentData =
            treatment.toPrimitives();

        // Responses

        return {
            patientId:
            patientData.id,

            patientName:
                `${patientData.name} ${patientData.lastName}`,

            riskLevel:
                treatment
                    .getRiskScore()
                    .getRiskLevel(),

            score:
                treatment
                    .getRiskScore()
                    .getScore(),

            adherenceScore:
            treatmentData
                .adherenceScore,

            totalConfirmed:
            treatmentData
                .totalConfirmed,

            totalOmitted:
            treatmentData
                .totalOmitted,

            treatment: {
                supplementName:
                treatmentData
                    .supplement,

                quantity:
                treatmentData
                    .quantity,

                dosingHours:
                treatmentData
                    .dosingHours,

                durationDays:
                treatmentData
                    .durationDays,

                startDate:
                treatmentData
                    .startDate,

                endDate:
                treatmentData
                    .endDate
            }
        };
    }

    async getPatientsByRiskLevel(query: GetPatientsByRiskLevelQuery): Promise<any> {
        // Buscar tratamientos por riesgo
        const treatments =
            await this
                .treatmentRepository
                .findByRiskLevel(
                    query.riskLevel,
                    query.nurseId
                );

        // Si no hay pacientes

        if (
            treatments.length === 0
        ) {
            return {
                riskLevel:
                query.riskLevel,

                total: 0,

                patients: []
            };
        }

        // Mapear pacientes

        const patients =
            await Promise.all(
                treatments.map(
                    async treatment => {

                        const treatmentData =
                            treatment
                                .toPrimitives();

                        const patient =
                            await this
                                .patientRepository
                                .findById(
                                    treatmentData.patientId
                                );

                        if (!patient) {
                            return null;
                        }

                        const patientData =
                            patient.toPrimitives();

                        // Calcular horas sin confirmar

                        const doses =
                            await this
                                .dailyDoseRepository
                                .findByTreatmentId(
                                    treatmentData.id
                                );

                        const pendingDoses =
                            doses.filter(
                                dose =>
                                    dose.getStatus() ===
                                    "PENDING"
                            );

                        let hoursWithoutConfirmation =
                            null;

                        if (
                            pendingDoses.length > 0 &&
                            query.riskLevel !== "LOW"
                        ) {
                            const oldestPending =
                                pendingDoses.sort(
                                    (a, b) =>
                                        a.getScheduledDate().getTime() -
                                        b.getScheduledDate().getTime()
                                )[0];

                            hoursWithoutConfirmation =
                                oldestPending
                                    .calculateHoursWithoutConfirmation();
                        }

                        // Edad paciente

                        let patientAge = null;

                        if (
                            patientData.birthDate
                        ) {
                            const birth =
                                new Date(
                                    patientData.birthDate
                                );

                            const today =
                                new Date();

                            patientAge =
                                today.getFullYear() -
                                birth.getFullYear();
                        }

                        // Retorno individual

                        return {
                            patientId:
                            patientData.id,

                            patientName:
                                `${patientData.name} ${patientData.lastName}`,

                            patientAge,

                            score:
                                treatment
                                    .getRiskScore()
                                    .getScore(),

                            hoursWithoutConfirmation
                        };
                    })
            );

        // Filter nulls + responses final
        return {
            riskLevel: query.riskLevel,
            total: patients.filter((p: any) => p !== null).length,
            patients: patients.filter((p: any) => p !== null)
        };
    }

    async getPendingPatientsByNurse(query: GetPendingPatientsByNurseQuery): Promise<any> {
        // Buscar pacientes assignados a la enfermera
        const patients =
            await this
                .patientRepository
                .findByNurseId(
                    query.nurseId
                );

        // Si no tiene pacientes asignados
        if (
            patients.length === 0
        ) {
            return {
                nurseId:
                query.nurseId,

                hasPatientsAssigned:
                    false,

                hasPendingPatients:
                    false,

                pendingPatients: [],

                message:
                    "No tienes pacientes asignados. Para comenzar, debes asignar pacientes a tu lista de trabajo."
            };
        }

        // Filtrar pacientes sin tratamiento activo

        const pendingPatients = [];

        for (const patient of patients) {

            const patientData =
                patient.toPrimitives();

            const activeTreatment =
                await this
                    .treatmentRepository
                    .findActiveByPatientId(
                        patientData.id
                    );

            if (!activeTreatment) {
                pendingPatients.push({
                    patientId:
                    patientData.id,

                    patientName:
                        `${patientData.name} ${patientData.lastName}`
                });
            }
        }

        // Si todos ya tienen tratamiento

        if (
            pendingPatients.length === 0
        ) {
            return {
                nurseId:
                query.nurseId,

                hasPatientsAssigned:
                    true,

                hasPendingPatients:
                    false,

                pendingPatients: [],

                message:
                    "Ya todos los pacientes han iniciado su tratamiento."
            };
        }

        // Responses

        return {
            nurseId:
            query.nurseId,

            hasPatientsAssigned:
                true,

            hasPendingPatients:
                true,

            pendingPatients
        };
    }

    async getRiskLevelOverview(query: GetRiskLevelOverviewQuery): Promise<any> {
        // Obtener tratamiento activos
        let treatments;

        if(query.nurseId) {
            treatments = await
                this.treatmentRepository
                    .findByNurseId(
                        query.nurseId,
                        TreatmentStatus.ACTIVE
                        );
        } else {
            treatments =
                await this.treatmentRepository.findAllActive();
        }

        // Contadores

        let high = 0;
        let medium = 0;
        let low = 0;

        // Recorrer Tratamientos
        for (const treatment of treatments) {
            const riskLevel =
                treatment
                    .getRiskScore()
                    .getRiskLevel();

            if (
                riskLevel ===
                RiskLevel.HIGH
            ) {
                high++;
            }

            else if (
                riskLevel ===
                RiskLevel.MEDIUM
            ) {
                medium++;
            }

            else {
                low++;
            }
        }

        // Responses

        return {
            summary: {
                HIGH: {
                    count: high,
                    description:
                        "score mayor de 70"
                },

                MEDIUM: {
                    count: medium,
                    description:
                        "score entre 30 y 70"
                },

                LOW: {
                    count: low,
                    description:
                        "score menor de 30"
                },

                total:
                treatments.length
            }
        };

    }

    async getTodayDose(query: GetTodayDoseQuery): Promise<any> {
        // Validar pacientes
        const patient =
            await this
                .patientRepository
                .findById(
                    query.patientId
                );

        if (!patient) {
            return {
                canConfirm: false,
                message:
                    "Register your patient first"
            };
        }

        // Validar madre

        const patientData =
            patient.toPrimitives();

        if (
            patientData.motherId !==
            query.motherId
        ) {
            throw new Error(
                "Mother is not assigned to this patient"
            );
        }

        // Buscar tratamiento activo

        const treatment =
            await this
                .treatmentRepository
                .findActiveByPatientId(
                    query.patientId
                );

        if (!treatment) {
            return {
                canConfirm: false,
                message:
                    "Treatment has not started yet"
            };
        }

        // Buscar dosis de hoy

        const todayDose =
            await this
                .dailyDoseRepository
                .findTodayDose(
                    treatment.getId()
                );

        if (!todayDose) {
            return {
                canConfirm: false,
                message:
                    "No scheduled dose for today"
            };
        }

        // Responses

        return {
            patientId:
            query.patientId,

            treatmentId:
                treatment.getId(),

            dailyDoseId:
                todayDose.getId(),

            scheduledDate:
                todayDose
                    .getScheduledDate(),

            status:
                todayDose
                    .getStatus(),

            canConfirm:
                todayDose
                    .getStatus() ===
                "PENDING"
        };
    }

    async getTreatmentDetails(query: GetTreatmentDetailsQuery): Promise<any> {
        // buscar tratamiento
        const treatment =
            await this
                .treatmentRepository
                .findById(
                    query.treatmentId
                );

        if (!treatment) {
            throw new Error(
                "Treatment not found"
            );
        }

        // Obtener paciente

        const treatmentData =
            treatment.toPrimitives();

        const patient =
            await this
                .patientRepository
                .findById(
                    treatmentData.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        // Obtener historial de dosis

        const doses =
            await this
                .dailyDoseRepository
                .findByTreatmentId(
                    treatmentData.id
                );

        // Ordenar cronologia

        const sortedDoses =
            doses.sort(
                (a, b) =>
                    b.getScheduledDate().getTime() -
                    a.getScheduledDate().getTime()
            );

        // Data paciente

        const patientData =
            patient.toPrimitives();

        // Responses

        return {
            treatmentId:
            treatmentData.id,

            patientId:
            treatmentData.patientId,

            patientName:
                `${patientData.name} ${patientData.lastName}`,

            status:
            treatmentData.status,

            supplementName:
            treatmentData.supplement,

            quantity:
            treatmentData.quantity,

            dosingHours:
            treatmentData.dosingHours,

            durationDays:
            treatmentData.durationDays,

            startDate:
            treatmentData.startDate,

            endDate:
            treatmentData.endDate,

            adherenceScore:
            treatmentData.adherenceScore,

            totalConfirmed:
            treatmentData.totalConfirmed,

            totalOmitted:
            treatmentData.totalOmitted,

            completionObservation:
            treatmentData
                .completionObservation,

            abandonmentObservation:
            treatmentData
                .abandonmentObservation,

            doses:
                sortedDoses.map(
                    dose =>
                        dose.toPrimitives()
                )
        };

    }

    async getTreatmentsByNurse(query: GetTreatmentsByNurseQuery): Promise<any> {
        // Buscar tratamientos
       const treatments =
           await this
               .treatmentRepository
               .findByNurseId(
                   query.nurseId,
                   query.status
               );
       // si no hay tratamientos

       if (
           treatments.length === 0
       ) {
           return {
               nurseId:
               query.nurseId,

               treatments: [],

               message:
                   "No treatments found"
           };
       }

       // Mapear con info del paciente

       const mappedTreatments =
           await Promise.all(
               treatments.map(
                   async treatment => {

                       const treatmentData =
                           treatment
                               .toPrimitives();

                       const patient =
                           await this
                               .patientRepository
                               .findById(
                                   treatmentData.patientId
                               );

                       const patientData =
                           patient
                               ?.toPrimitives();

                       return {
                           treatmentId:
                           treatmentData.id,

                           patientId:
                           treatmentData.patientId,

                           patientName:
                               patientData
                                   ? `${patientData.name} ${patientData.lastName}`
                                   : "Unknown patient",

                           status:
                           treatmentData.status,

                           supplementName:
                           treatmentData.supplement
                       };
                   }
               )
           );

       return {
           nurseId:
           query.nurseId,

           treatments:
           mappedTreatments
       };
    }
}