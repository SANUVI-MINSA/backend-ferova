import {GetNurseInfoForConsultationQuery} from "../../domain/model/queries/GetNurseInfoForConsultationQuery";

export class GetNurseInfoForConsultationQueryAssembler {

    static toQuery(
        patientId: string
    ): GetNurseInfoForConsultationQuery {

        return {
            patientId
        };
    }
}