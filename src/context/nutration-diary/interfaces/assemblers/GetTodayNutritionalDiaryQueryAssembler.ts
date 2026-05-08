import {GetTodayNutritionalDiaryQuery} from "../../model/domain/queries/GetTodayNutritionalDiaryQuery";

export class GetTodayNutritionalDiaryQueryAssembler {

    static toQuery(
        patientId: string
    ): GetTodayNutritionalDiaryQuery {

        return {
            patientId
        };
    }
}