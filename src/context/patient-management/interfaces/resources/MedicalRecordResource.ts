export type MedicalRecordResource = {
    medicalRecordId: string;
    patientId: string;
    nurseId: string;
    weight: number;
    height: number;
    hemoglobinLevel: number;
    motivoConsulta: string;
    observaciones?: string;
    antecedentes: any[];
    sintomas: string[];
};