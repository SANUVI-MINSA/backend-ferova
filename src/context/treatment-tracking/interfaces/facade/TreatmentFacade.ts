import {TreatmentCommandService} from "../../model/services/TreatmentCommandService";
import {TreatmentQueryService} from "../../model/services/TreatmentQueryService";
import {PatientRepository} from "../../../patient-management/domain/repositories/PatientRepository";

export class TreatmentFacade {

    constructor(
        private commandService:
        TreatmentCommandService,
        private queryService:
        TreatmentQueryService,
        private patientRepository:
            PatientRepository
    ) {}

    async startTreatment(
        command: any
    ) {

        return this
            .commandService
            .startTreatment(
                command
            );
    }

    async confirmDose(
        command: any
    ) {
        return this
            .commandService
            .confirmDose(
                command
            );
    }

    async completeTreatment(
        command: any
    ) {
        return this
            .commandService
            .completeTreatment(
                command
            );
    }

    async abandonTreatment(
        command: any
    ) {
        return this
            .commandService
            .abandonTreatment(
                command
            );
    }

    async evaluateMissedDose(
        command: any
    ) {
        return this
            .commandService
            .evaluateMissedDose(
                command
            );
    }

    async getTodayDose(
        query: any
    ) {
        return this
            .queryService
            .getTodayDose(
                query
            );
    }

    async getPatientDoseHistory(
        query: any
    ) {
        // Validar que la madre tiene acceso al paciente
        if (query.motherId) {
            await this.validateMotherHasPatient(query.motherId, query.patientId);
        }

        return this
            .queryService
            .getPatientDoseHistory(
                query
            );
    }

    async getPendingPatientsByNurse(
        query: any
    ) {
        return this
            .queryService
            .getPendingPatientsByNurse(
                query
            );
    }

    async getRiskLevelOverview(
        query: any
    ) {
        return this
            .queryService
            .getRiskLevelOverview(
                query
            );
    }

    async getTreatmentsByNurse(
        query: any
    ) {
        return this
            .queryService
            .getTreatmentsByNurse(
                query
            );
    }

    async getTreatmentDetails(
        query: any
    ) {
        return this
            .queryService
            .getTreatmentDetails(
                query
            );
    }

    async getPatientsByRiskLevel(
        query: any
    ) {
        return this
            .queryService
            .getPatientsByRiskLevel(
                query
            );
    }

    async getPatientTreatmentDetail(
        query: any
    ) {
        return this
            .queryService
            .getPatientTreatmentDetail(
                query
            );
    }

    async getCriticalAlertsByNurse(
        query: any
    ) {
        return this
            .queryService
            .getCriticalAlertsByNurse(
                query
            );
    
    }

    async validateNurseHasPatient(nurseId: string, patientId: string): Promise<void> {
        const patient = await this.patientRepository.findById(patientId);

        if (!patient) {
            throw new Error("Patient not found");
        }

        const patientData = patient.toPrimitives();

        if (patientData.nurseId !== nurseId) {
            throw new Error("Access denied: This patient is not assigned to you");
        }
    }

    // Nuevo método para validar madre-paciente
    async validateMotherHasPatient(motherId: string, patientId: string): Promise<void> {
        const patient = await this.patientRepository.findById(patientId);

        if (!patient) {
            throw new Error("Patient not found");
        }

        const patientData = patient.toPrimitives();

        if (patientData.motherId !== motherId) {
            throw new Error("Access denied: This patient is not assigned to you");
        }
    }

    async forceOmitDoseForTesting(dailyDoseId: string) {
        return this.commandService.forceOmitDoseForTesting(dailyDoseId);
    }

}