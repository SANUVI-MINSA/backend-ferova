import {TreatmentRepository} from "../../../../model/repositories/TreatmentRepository";
import {Treatment} from "../../../../model/domain/aggregates/Treatment";
import {TreatmentMapper} from "../../../mappers/TreatmentMapper";
import {TreatmentModel} from "../models/TreatmentModel";
import {TreatmentStatus} from "../../../../model/domain/value-objects/enum/TreatementStatus";
import {RiskLevel} from "../../../../model/domain/value-objects/enum/RiskLevel";

export class MongoTreatmentRepository
    implements TreatmentRepository {

    async save(
        treatment: Treatment
    ): Promise<void> {

        const data =
            TreatmentMapper
                .toPersistence(
                    treatment
                );

        await TreatmentModel
            .create(data);
    }

    async findActiveByPatientId(
        patientId: string
    ): Promise<Treatment | null> {

        const treatment =
            await TreatmentModel
                .findOne({
                    patientId,
                    status:
                    TreatmentStatus.ACTIVE
                });

        if (!treatment) {
            return null;
        }

        return TreatmentMapper
            .toDomain(
                treatment
            );
    }

    async findAllActive(): Promise<Treatment[]> {

        const treatments =
            await TreatmentModel
                .find({
                    status:
                    TreatmentStatus.ACTIVE
                });

        return treatments.map(
            t =>
                TreatmentMapper
                    .toDomain(t)
        );
    }

    async findById(
        treatmentId: string
    ): Promise<Treatment | null> {

        const treatment =
            await TreatmentModel
                .findOne({
                    id: treatmentId
                });

        if (!treatment) {
            return null;
        }

        return TreatmentMapper
            .toDomain(
                treatment
            );
    }

    async findByNurseId(
        nurseId: string,
        status?: TreatmentStatus
    ): Promise<Treatment[]> {

        const filter: any = {
            nurseId
        };

        if (status) {
            filter.status =
                status;
        }

        const treatments =
            await TreatmentModel
                .find(filter);

        return treatments.map(
            t =>
                TreatmentMapper
                    .toDomain(t)
        );
    }

    async findByPatientId(
        patientId: string
    ): Promise<Treatment[]> {

        const treatments =
            await TreatmentModel
                .find({
                    patientId
                });

        return treatments.map(
            t =>
                TreatmentMapper
                    .toDomain(t)
        );
    }

    async findByRiskLevel(
        riskLevel: RiskLevel,
        nurseId?: string
    ): Promise<Treatment[]> {

        const filter: any = {
            status:
            TreatmentStatus.ACTIVE,
            "riskScore.riskLevel":
            riskLevel
        };

        if (nurseId) {
            filter.nurseId =
                nurseId;
        }

        const treatments =
            await TreatmentModel
                .find(filter);

        return treatments.map(
            t =>
                TreatmentMapper
                    .toDomain(t)
        );
    }

    async update(
        treatment: Treatment
    ): Promise<void> {

        const data =
            TreatmentMapper
                .toPersistence(
                    treatment
                );

        await TreatmentModel
            .findOneAndUpdate(
                { id: data.id },
                data
            );
    }
    
}