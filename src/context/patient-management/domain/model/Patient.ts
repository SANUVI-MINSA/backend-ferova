import {BirthDate} from "../value-objects/BirthDate";
import {Weight} from "../value-objects/Weight";
import {Height} from "../value-objects/Height";
import {Gender} from "../enum/Gender";
import {PatientStatus} from "../enum/PatientStatus";
import {MedicalRecord} from "../entities/MedicalRecord";

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
        private medicalRecord?: MedicalRecord | null // Asociación con MedicalRecord, Por que cada paciente tiene un historial médico asociado. Tambien puede ser null inicialmente, ya que el historial médico se crea después de registrar al paciente.
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

            // MedicalRecord se convierte a un objeto primitivo utilizando su método toPrimitives() si existe, de lo contrario se asigna null.
            //  Esto permite incluir la información del historial médico del paciente en la representación primitiva del
            //  paciente, facilitando su uso en otras partes de la aplicación, como en la capa de infraestructura o en la presentación.
            medicalRecord:
                this.medicalRecord
                    ? this.medicalRecord
                        .toPrimitives()
                    : null
        };
    }

    /**
     * Metodo para crear el historial medico del paciente, se asegura de que el paciente no tenga un historial médico previo antes de asignar uno nuevo.
     * @param medicalRecord
     */
    createMedicalRecord(
        medicalRecord: MedicalRecord
    ): void {

        if (this.medicalRecord) {
            throw new Error(
                "Patient already has a medical record"
            );
        }

        this.medicalRecord =
            medicalRecord;
    }
}