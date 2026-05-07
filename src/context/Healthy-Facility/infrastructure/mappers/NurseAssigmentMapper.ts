import {NurseAssignment} from "../../domain/model/entities/NurseAssignment";

export class NurseAssigmentMapper {
    static toDomain(document: any): NurseAssignment {
        return new NurseAssignment(
            document.id,
            document.facilityId,
            document.nurseId
        )
    }

    static toPersistence(assigment: NurseAssignment) {
        const data = assigment.toPrimitives()

        return {
            id: data.id,
            facilityId: data.facilityId,
            nurseId: data.nurseId
        }
    }
}