import {PatientRepository} from "../../../../domain/repositories/PatientRepository";
import {Patient} from "../../../../domain/model/aggregate/Patient";
import {PatientMapper} from "../../../mappers/PatientMapper";
import {PatientModel} from "../models/PatientModel";
import {PatientStatus} from "../../../../domain/model/enum/PatientStatus";

export class MongoPatientRepository
    implements PatientRepository {

    async save(
        patient: Patient
    ): Promise<Patient> {

        const data =
            PatientMapper
                .toPersistence(
                    patient
                );

        const created =
            await PatientModel.create(
                data
            );

        return PatientMapper
            .toDomain(
                created
            );
    }

    async findById(
        patientId: string
    ): Promise<Patient | null> {

        const patient =
            await PatientModel.findOne({
                id: patientId
            });

        if (!patient) {
            return null;
        }

        return PatientMapper
            .toDomain(
                patient
            );
    }

    async findByMotherId(
        motherId: string
    ): Promise<Patient[]> {

        const patients =
            await PatientModel.find({
                motherId
            });

        return patients.map(
            patient =>
                PatientMapper
                    .toDomain(
                        patient
                    )
        );
    }

    async findByNurseId(
        nurseId: string
    ): Promise<Patient[]> {

        const patients =
            await PatientModel.find({
                nurseId
            });

        return patients.map(
            patient =>
                PatientMapper
                    .toDomain(
                        patient
                    )
        );
    }

    async update(
        patient: Patient
    ): Promise<void> {

        const data =
            PatientMapper
                .toPersistence(
                    patient
                );

        await PatientModel.updateOne(
            { id: data.id },
            data
        );
    }


    async findPatientsEligibleForDischarge(
        nurseId: string
    ): Promise<Patient[]> {

        const patients =
            await PatientModel.find({
                nurseId,
                status: {
                    $ne:
                    PatientStatus
                        .DISCHARGED
                }
            });

        return patients.map(
            patient =>
                PatientMapper
                    .toDomain(
                        patient
                    )
        );
    }
}