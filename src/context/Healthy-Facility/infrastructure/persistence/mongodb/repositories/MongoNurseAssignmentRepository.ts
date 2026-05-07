import {NurseAssignmentRepository} from "../../../../domain/repositories/NurseAssignmentRepository";
import {NurseAssignment} from "../../../../domain/model/entities/NurseAssignment";
import {NurseAssigmentMapper} from "../../../mappers/NurseAssigmentMapper";
import {NurseAssignmentModel} from "../models/NurseAssignmentModel";

export class MongoNurseAssignmentRepository implements NurseAssignmentRepository {

    /**
     * Busca una asignación activa de enfermero por su ID.
     *
     * @description
     * Este método recupera la posta a la que un enfermero está actualmente asignado.
     * Como un enfermero solo puede estar en una posta a la vez, retorna un único
     * resultado o null si no tiene asignación.
     *
     * @param nurseId - Identificador único del enfermero
     * @returns La asignación del enfermero si existe, null en caso contrario
     *
     * @example
     * ```typescript
     * const assignment = await repository.findActiveByNurseId("nurse-123");
     * if (assignment) {
     *     console.log(`Enfermero asignado a posta: ${assignment.getFacilityId()}`);
     * }
     * ```
     */
    async findActiveByNurseId(
        nurseId: string
    ): Promise<NurseAssignment | null> {

        const assignment =
            await NurseAssignmentModel.findOne({
                nurseId
            });

        if (!assignment) {
            return null;
        }

        return NurseAssigmentMapper.toDomain(assignment);
    }
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

    async findActiveByFacilityId(
        facilityId: string
    ): Promise<NurseAssignment | null> {

        const assignment =
            await NurseAssignmentModel.findOne({
                facilityId
            });

        if (!assignment) {
            return null;
        }

        return NurseAssigmentMapper
            .toDomain(assignment);
    }

}