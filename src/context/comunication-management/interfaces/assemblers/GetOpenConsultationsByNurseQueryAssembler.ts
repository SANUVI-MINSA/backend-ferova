import {GetOpenConsultationsByNurseQuery} from "../../domain/model/queries/GetOpenConsultationsByNurseQuery";

export class GetOpenConsultationsByNurseQueryAssembler {

    static toQuery(
        nurseId: string,
        searchTerm?: string
    ): GetOpenConsultationsByNurseQuery {

        return {
            nurseId,
            searchTerm
        };
    }
}