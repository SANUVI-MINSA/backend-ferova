import {NurseAssignment} from "../model/entities/NurseAssignment";

export interface NurseAssignmentRepository{
    /**
     * Saves the nurse assignment to the repository.
     * @param assigment
     */
    save(
        assigment: NurseAssignment
    ): Promise<NurseAssignment>

    /**
     * Finds all nurse assignments by facility id.
     * @param facilityId
     */
    findByFacilityId(
        facilityId: string
    ): Promise<NurseAssignment[]>

    /**
     * Finds all nurse assignments by nurse id.
     * @param nurseId
     */
    findByNurseId(
        nurseId: string
    ): Promise<NurseAssignment | null>


}