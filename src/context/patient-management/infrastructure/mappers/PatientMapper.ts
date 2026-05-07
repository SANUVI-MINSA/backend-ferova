import {Patient} from "../../domain/model/aggregate/Patient";
import {BirthDate} from "../../domain/model/value-objects/BirthDate";
import {Weight} from "../../domain/model/value-objects/Weight";
import {Height} from "../../domain/model/value-objects/Height";
import {Gender} from "../../domain/model/enum/Gender";
import {PatientStatus} from "../../domain/model/enum/PatientStatus";

export class PatientMapper {

    static toDomain(
        document: any
    ): Patient {

        return new Patient(
            document.id,
            document.name,
            document.lastName,

            new BirthDate(
                document.birthDate
            ),

            new Weight(
                document.currentWeight
            ),

            new Height(
                document.currentHeight
            ),

            document.motherId,

            document.nurseId,

            document.gender as Gender,

            document.facilityId,

            document.status as PatientStatus
        );
    }

    static toPersistence(
        patient: Patient
    ) {

        const data =
            patient.toPrimitives();

        return {
            id: data.id,
            name: data.name,
            lastName:
            data.lastName,
            birthDate:
            data.birthDate,
            currentWeight:
            data.currentWeight,
            currentHeight:
            data.currentHeight,
            motherId:
            data.motherId,
            nurseId:
            data.nurseId,
            gender:
            data.gender,
            facilityId:
            data.facilityId,
            status:
            data.status
        };
    }
}