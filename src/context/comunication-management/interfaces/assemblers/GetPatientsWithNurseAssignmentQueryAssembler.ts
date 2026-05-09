import {GetPatientsWithNurseAssignmentQuery} from "../../domain/model/queries/GetPatientsWithNurseAssignmentQuery";

export class GetPatientsWithNurseAssignmentQueryAssembler {

    static toQuery(
        motherId: string
    ): GetPatientsWithNurseAssignmentQuery {

        return {
            motherId
        };
    }
}