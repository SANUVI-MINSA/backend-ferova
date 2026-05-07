import {Patient} from "../../domain/model/aggregate/Patient";
import {PatientResource} from "../resources/PatientResource";

export class PatientResourceAssembler {

    static toResource(
        patient: Patient
    ): PatientResource {

        const data =
            patient.toPrimitives();

        return {
            patientId: data.id,
            patientName: data.name,
            patientLastName:
            data.lastName,
            gender:
            data.gender,
            status:
            data.status,
            statusAssignment:
                data.nurseId
                    ? "ASSIGNED"
                    : "UNASSIGNED"
        };
    }
}