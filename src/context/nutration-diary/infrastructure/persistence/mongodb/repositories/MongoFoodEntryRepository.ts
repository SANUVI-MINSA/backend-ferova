import {FoodEntryRepository} from "../../../../model/repositories/FoodEntryRepository";
import {Promise} from "mongoose";
import {FoodEntry} from "../../../../model/domain/entities/FoodEntry";
import {FoodEntryMapper} from "../../../mappers/FoodEntryMapper";
import {FoodEntryModel} from "../models/FoodEntryModel";

export class MongoFoodEntryRepository
    implements FoodEntryRepository {

    async save(
        entry: FoodEntry
    ): Promise<void> {

        const data =
            FoodEntryMapper
                .toPersistence(
                    entry
                );

        await FoodEntryModel
            .create(data);
    }

    async findByDiaryId(
        diaryId: string
    ): Promise<FoodEntry[]> {

        const entries =
            await FoodEntryModel
                .find({
                    diaryId
                });

        return entries.map(
            entry =>
                FoodEntryMapper
                    .toDomain(entry)
        );
    }

    async countByDiaryId(
        diaryId: string
    ): Promise<number> {

        return await FoodEntryModel
            .countDocuments({
                diaryId
            });
    }
}