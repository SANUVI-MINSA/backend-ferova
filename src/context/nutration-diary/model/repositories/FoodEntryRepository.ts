import {FoodEntry} from "../domain/entities/FoodEntry";

export interface FoodEntryRepository {

    save(
        entry: FoodEntry
    ): Promise<void>;

    findByDiaryId(
        diaryId: string
    ): Promise<FoodEntry[]>;

    countByDiaryId(
        diaryId: string
    ): Promise<number>;
}