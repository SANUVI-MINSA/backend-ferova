import {MedicalRecordRepository} from "../../../../domain/repositories/MedicalRecordRepository";
import {MedicalRecord} from "../../../../domain/model/entities/MedicalRecord";
import {MedicalRecordMapper} from "../../../mappers/MedicalMapper";
import {MedicalRecordModel} from "../models/MedicalRecordModel";


export class
MongoMedicalRecordRepository
    implements MedicalRecordRepository {

    async save(
        medicalRecord: MedicalRecord
    ): Promise<MedicalRecord> {

        const data =
            MedicalRecordMapper
                .toPersistence(
                    medicalRecord
                );

        const created =
            await MedicalRecordModel
                .create(data);

        return MedicalRecordMapper
            .toDomain(
                created
            );
    }

    async findById(
        medicalRecordId: string
    ): Promise<MedicalRecord | null> {

        const medicalRecord =
            await MedicalRecordModel
                .findOne({
                    id:
                    medicalRecordId
                });

        if (!medicalRecord) {
            return null;
        }

        return MedicalRecordMapper
            .toDomain(
                medicalRecord
            );
    }

    async findByPatientId(
        patientId: string
    ): Promise<MedicalRecord | null> {

        const medicalRecord =
            await MedicalRecordModel
                .findOne({
                    patientId
                });

        if (!medicalRecord) {
            return null;
        }

        return MedicalRecordMapper
            .toDomain(
                medicalRecord
            );
    }

    async update(
        medicalRecord: MedicalRecord
    ): Promise<void> {

        const data =
            MedicalRecordMapper
                .toPersistence(
                    medicalRecord
                );

        await MedicalRecordModel
            .updateOne(
                { id: data.id },
                data
            );
    }

    async delete(
        medicalRecordId: string
    ): Promise<void> {
        await MedicalRecordModel
            .findOneAndDelete({
                id: medicalRecordId
            });
    }
}