import { GetTodayNutritionalDiaryQuery } from "../../model/domain/queries/GetTodayNutritionalDiaryQuery";

export class GetTodayNutritionalDiaryQueryAssembler {

    /**
     * ✅ MODIFICADO: Acepta fecha opcional
     */
    static toQuery(
        patientId: string,
        date?: string
    ): GetTodayNutritionalDiaryQuery {

        if (date) {
            console.log(`[GetTodayNutritionalDiaryQueryAssembler] toQuery - patientId: ${patientId}, date: ${date}`);
        } else {
            console.log(`[GetTodayNutritionalDiaryQueryAssembler] toQuery - patientId: ${patientId}, usando fecha actual`);
        }

        return {
            patientId,
            date
        };
    }
}