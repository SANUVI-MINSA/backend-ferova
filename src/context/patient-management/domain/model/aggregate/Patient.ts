import {BirthDate} from "../value-objects/BirthDate";
import {Weight} from "../value-objects/Weight";
import {Height} from "../value-objects/Height";
import {Gender} from "../enum/Gender";
import {PatientStatus} from "../enum/PatientStatus";

export class Patient {
    constructor(
        private id: string,
        private name: string,
        private lastName: string,
        private birthDate: BirthDate,
        private currentWeight: Weight,
        private currentHeight: Height,
        private motherId: string,
        private nurseId: string | null,
        private gender: Gender,
        private facilityId: string | null,
        private status: PatientStatus,
) {}

    private ensureMotherExists(): void {
        if(!this.motherId) {
            throw new Error("mother is required");
        }
    }

    private ensureNurseAssigned(): void {
        if(this.nurseId) {
            throw new Error("nurse is required");
        }
    }

    discharge(nurseId: string): void {

        if(
            nurseId !== this.nurseId
        ){
            throw new Error("Only assigned nurse can discharge patient");
        }

        this.status = PatientStatus.DISCHARGED;

        this.nurseId = null;
        this.facilityId = null;
    }

    assignNurse(nurseId: string, facilityId: string): void {
        // ✅ Si el paciente ya tiene enfermera y NO está dado de alta, lanzar error
        if (this.nurseId && this.status !== PatientStatus.DISCHARGED) {
            throw new Error("Patient already has an assigned nurse");
        }

        // ✅ Si el paciente está dado de alta, permitir reasignación
        this.nurseId = nurseId;
        this.facilityId = facilityId;
        // Opcional: Reactivar el paciente automáticamente al reasignarlo
        this.status = PatientStatus.ACTIVE;
    }

    public toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            lastName:
            this.lastName,

            birthDate:
                this.birthDate.getValue(),

            currentWeight:
                this.currentWeight.getValue(),

            currentHeight:
                this.currentHeight.getValue(),

            motherId:
            this.motherId,

            nurseId:
            this.nurseId,

            gender:
            this.gender,

            facilityId:
            this.facilityId,

            status:
            this.status,
        };
    }


}