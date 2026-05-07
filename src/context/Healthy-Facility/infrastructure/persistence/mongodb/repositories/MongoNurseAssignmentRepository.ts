import {NurseAssignmentRepository} from "../../../../domain/repositories/NurseAssignmentRepository";
import {NurseAssignment} from "../../../../domain/model/entities/NurseAssignment";
import {NurseAssigmentMapper} from "../../../mappers/NurseAssigmentMapper";
import {NurseAssignmentModel} from "../models/NurseAssignmentModel";

export class MongoNurseAssignmentRepository implements NurseAssignmentRepository {
    async findByFacilityId(facilityId: string): Promise<NurseAssignment[]> {

       const assignment =
           await NurseAssignmentModel.find({
               facilityId
           })

        return assignment.map(
            assignment =>
                NurseAssigmentMapper
                    .toDomain(assignment)
        );
    }

    async findByNurseId(nurseId: string): Promise<NurseAssignment | null> {

        const assignment =
            await NurseAssignmentModel.findOne(
                {
                    nurseId
                }
            );

        if(!assignment) {
            return null
        }

        return NurseAssigmentMapper
            .toDomain(assignment)
    }

    async save(assigment: NurseAssignment): Promise<NurseAssignment> {

        const data =
            NurseAssigmentMapper.toPersistence(assigment);

        const createAssignment =
            await NurseAssignmentModel.create(
                data
            )

        return NurseAssigmentMapper
            .toDomain(createAssignment);
    }

}