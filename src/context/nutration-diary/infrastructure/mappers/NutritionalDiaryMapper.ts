import {NutritionalDiary} from "../../model/domain/aggregate/NutritionalDiary";

export class NutritionalDiaryMapper {

    static toDomain(
        document: any
    ): NutritionalDiary {

        return new NutritionalDiary(
            document.id,
            document.patientId,
            document.motherId,
            document.date,
            document.totalIronAbsorbed,
            document.hasInhibitor
        );
    }

    static toPersistence(
        diary: NutritionalDiary
    ) {
        return diary.toPrimitives();
    }
}