/**
 * Estado Inicial
 * status = "ACTIVE"
 * nurseId = null
 * facilityId = null
 * medicalRecord = null
 */
export type RegisterPatientCommand = Readonly<{
    name: string;
    lastName: string;
    birthDate: Date;
    gender: string;
    weight: number;
    height: number;
    motherId: string;
}>;
