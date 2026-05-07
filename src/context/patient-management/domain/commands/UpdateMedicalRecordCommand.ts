import {Antecedente} from "../value-objects/Antecedente";

export type UpdateMedicalRecordCommand =
    Readonly<{
        patientId: string;
        weight: number;
        height: number;
        motivoConsulta: string;
        observaciones?: string;
        antecedentes?: Antecedente[];
        sintomas?: string[];
    }>;