import {Antecedente} from "../value-objects/Antecedente";


export type CreateInitialMedicalRecordCommand =
    Readonly<{
        patientId: string;
        weight: number;
        height: number;
        motivoConsulta: string;
        observaciones?: string;
        antecedentes?: Antecedente[]; // Optional
        sintomas?: string[]; // Optional
    }>;