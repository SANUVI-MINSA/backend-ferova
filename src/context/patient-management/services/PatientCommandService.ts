import {RegisterPatientCommand} from "../domain/commands/RegisterPatientCommand";
import {AssignPatientToNurseCommand} from "../domain/commands/AssignPatientToNurseCommand";
import {CreateInitialMedicalRecordCommand} from "../domain/commands/CreateInitialMedicalRecordCommand";
import {RegisterHemoglobinControlCommand} from "../domain/commands/RegisterHemoglobinControlCommand";
import {DischargePatientCommand} from "../domain/commands/DischargePatientCommand";
import {UpdateMedicalRecordCommand} from "../domain/commands/UpdateMedicalRecordCommand";



export interface PatientCommandService {

    registerPatient(
        command: RegisterPatientCommand
    ): Promise<void>;

    assignPatientToNurse(
        command: AssignPatientToNurseCommand
    ): Promise<void>;

    createInitialMedicalRecord(
        command:
        CreateInitialMedicalRecordCommand
    ): Promise<void>;

    registerHemoglobinControl(
        command:
        RegisterHemoglobinControlCommand
    ): Promise<void>;

    dischargePatient(
        command:
        DischargePatientCommand
    ): Promise<void>;

    updateMedicalRecord(
        command:
        UpdateMedicalRecordCommand
    ): Promise<void>;
}