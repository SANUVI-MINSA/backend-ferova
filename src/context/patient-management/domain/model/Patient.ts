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
        private nurseId: string,
        private gender: Gender,
        private facilityId: string,
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
    }

    assignNurse(
        nurseId: string
    ): void {

        if (this.nurseId) {
            throw new Error(
                "Patient already has an assigned nurse"
            );
        }

        this.nurseId =
            nurseId;
    }

    toPrimitives() {
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