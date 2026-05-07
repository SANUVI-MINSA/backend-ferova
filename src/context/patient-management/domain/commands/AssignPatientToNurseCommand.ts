/**
 * Automaticamente obtenemos el facilityId
 */
export type AssignPatientToNurseCommand = Readonly<{
    patientId: string;
    nurseId: string;
}>;