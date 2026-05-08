import {GetNutritionalHistoryQuery} from "../../model/domain/queries/GetNutritionalHistoryQuery";

export class GetNutritionalHistoryQueryAssembler {

    static toQuery(
        patientId: string,
        startDate?: Date,
        endDate?: Date
    ): GetNutritionalHistoryQuery {

        return {
            patientId,
            startDate,
            endDate
        };
    }
}