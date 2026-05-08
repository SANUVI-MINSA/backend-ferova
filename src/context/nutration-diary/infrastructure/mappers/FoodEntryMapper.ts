import {FoodEntry} from "../../model/domain/entities/FoodEntry";

export class FoodEntryMapper {

    static toDomain(
        document: any
    ): FoodEntry {

        return new FoodEntry(
            document.id,
            document.diaryId,
            document.foodItemId,
            document.quantity,
            document.unit,
            document.ironContributed,
            document.registeredAt
        );
    }

    static toPersistence(
        entry: FoodEntry
    ) {
        return entry.toPrimitives();
    }
}