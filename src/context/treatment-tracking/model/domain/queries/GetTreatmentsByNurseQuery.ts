import {TreatmentStatus} from "../value-objects/enum/TreatementStatus";

export type GetTreatmentsByNurseQuery =
    Readonly<{
        nurseId: string;
        status?: TreatmentStatus;
    }>;