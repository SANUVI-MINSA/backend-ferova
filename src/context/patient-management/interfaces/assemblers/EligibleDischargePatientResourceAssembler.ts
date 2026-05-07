import {Patient} from "../../domain/model/aggregate/Patient";

export class
EligibleDischargePatientResourceAssembler {

    static toResource(
        patient: Patient
    ) {

        const data =
            patient.toPrimitives();

        return {
            patientId:
            data.id,

            fullName:
                `${data.name} ${data.lastName}`,

            status:
            data.status
        };
    }
}