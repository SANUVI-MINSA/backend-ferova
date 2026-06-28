import {MedicalRecord} from "../model/entities/MedicalRecord";


export interface MedicalRecordRepository {

    save(
        medicalRecord: MedicalRecord
    ): Promise<MedicalRecord>;

    findById(
        medicalRecordId: string
    ): Promise<MedicalRecord | null>;

    findByPatientId(
        patientId: string
    ): Promise<MedicalRecord | null>;

    update(
        medicalRecord: MedicalRecord
    ): Promise<void>;

    delete(
        medicalRecordId: string
    ): Promise<void>;
}