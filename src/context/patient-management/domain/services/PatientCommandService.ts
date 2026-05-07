import {RegisterPatientCommand} from "../model/commands/RegisterPatientCommand";
import {AssignPatientToNurseCommand} from "../model/commands/AssignPatientToNurseCommand";
import {CreateInitialMedicalRecordCommand} from "../model/commands/CreateInitialMedicalRecordCommand";
import {RegisterHemoglobinControlCommand} from "../model/commands/RegisterHemoglobinControlCommand";
import {DischargePatientCommand} from "../model/commands/DischargePatientCommand";
import {UpdateMedicalRecordCommand} from "../model/commands/UpdateMedicalRecordCommand";



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