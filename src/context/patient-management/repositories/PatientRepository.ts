import {Patient} from "../domain/model/Patient";

export interface PatientRepository {

    save(
        patient: Patient
    ): Promise<Patient>;

    findById(
        patientId: string
    ): Promise<Patient | null>;

    findByMotherId(
        motherId: string
    ): Promise<Patient[]>;

    findByNurseId(
        nurseId: string
    ): Promise<Patient[]>;

    update(
        patient: Patient
    ): Promise<void>;

    findPatientsEligibleForDischarge(
        nurseId: string
    ): Promise<Patient[]>;
}