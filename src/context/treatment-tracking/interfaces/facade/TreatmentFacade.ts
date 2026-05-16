import {TreatmentCommandService} from "../../model/services/TreatmentCommandService";
import {TreatmentQueryService} from "../../model/services/TreatmentQueryService";

export class TreatmentFacade {

    constructor(
        private commandService:
        TreatmentCommandService,
        private queryService:
        TreatmentQueryService
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


}