import {GetOpenConsultationsByMotherQuery} from "../../domain/model/queries/GetOpenConsultationsByMotherQuery";

export class GetOpenConsultationsByMotherQueryAssembler {

    static toQuery(
        motherId: string
    ): GetOpenConsultationsByMotherQuery {

        return {
            motherId
        };
    }
}