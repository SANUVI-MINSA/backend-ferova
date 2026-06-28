import {TreatmentStatus} from "../domain/value-objects/enum/TreatementStatus";
import {Treatment} from "../domain/aggregates/Treatment";
import {RiskLevel} from "../domain/value-objects/enum/RiskLevel";

export interface TreatmentRepository {

    save(
        treatment: Treatment
    ): Promise<void>;

    update(
        treatment: Treatment
    ): Promise<void>;

    findById(
        treatmentId: string
    ): Promise<Treatment | null>;

    findActiveByPatientId(
        patientId: string
    ): Promise<Treatment | null>;

    findByPatientId(
        patientId: string
    ): Promise<Treatment[]>;

    findByNurseId(
        nurseId: string,
        status?: TreatmentStatus
    ): Promise<Treatment[]>;

    findByRiskLevel(
        riskLevel: RiskLevel,
        nurseId?: string
    ): Promise<Treatment[]>;

    findAllActive(): Promise<Treatment[]>;

    delete(treatmentId: string): Promise<void>;

}