import {Antecedente} from "../value-objects/Antecedente";

export type UpdateMedicalRecordCommand = Readonly<{
        patientId: string;
        weight?: number;           // Opcional
        height?: number;           // Opcional
        motivoConsulta?: string;   // Opcional
        observaciones?: string;    // Opcional
        antecedentes?: Antecedente[];  // Opcional (undefined = no actualizar)
        sintomas?: string[];            // Opcional (undefined = no actualizar)
}>;