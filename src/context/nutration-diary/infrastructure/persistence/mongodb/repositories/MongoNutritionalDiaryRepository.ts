import {NutritionalDiaryRepository} from "../../../../model/repositories/NutritionalDiaryRepository";
import {NutritionalDiary} from "../../../../model/domain/aggregate/NutritionalDiary";
import {Promise} from "mongoose";
import {NutritionalDiaryMapper} from "../../../mappers/NutritionalDiaryMapper";
import {NutritionalDiaryModel} from "../models/NutritionalDiarySchema";

export class MongoNutritionalDiaryRepository
    implements NutritionalDiaryRepository {

    async save(
        diary: NutritionalDiary
    ): Promise<void> {

        const data =
            NutritionalDiaryMapper
                .toPersistence(
                    diary
                );

        await NutritionalDiaryModel
            .create(data);
    }

    async update(
        diary: NutritionalDiary
    ): Promise<void> {

        const data =
            NutritionalDiaryMapper
                .toPersistence(
                    diary
                );

        await NutritionalDiaryModel
            .findOneAndUpdate(
                {
                    id: data.id
                },
                data
            );
    }

    async findTodayByPatientId(
        patientId: string
    ): Promise<NutritionalDiary | null> {

        const now = new Date();

        const peruDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));

        const startOfDayPeru = new Date(peruDate);
        startOfDayPeru.setHours(0, 0, 0, 0);

        const endOfDayPeru = new Date(peruDate);
        endOfDayPeru.setHours(23, 59, 59, 999);

        const startUTC = new Date(startOfDayPeru.toISOString());
        const endUTC = new Date(endOfDayPeru.toISOString());



        const diary =
            await NutritionalDiaryModel
                .findOne({
                    patientId,
                    date: {
                        $gte: startUTC,
                        $lte: endUTC
                    }
                });

        if (!diary) {
            return null;
        }

        return NutritionalDiaryMapper
            .toDomain(diary);
    }

    async findByPatientAndDateRange(
        patientId: string,
        startDate: Date,
        endDate: Date
    ): Promise<NutritionalDiary[]> {

        const startPeru = new Date(startDate.toLocaleString("en-US", { timeZone: "America/Lima" }));
        startPeru.setHours(0, 0, 0, 0);

        const endPeru = new Date(endDate.toLocaleString("en-US", { timeZone: "America/Lima" }));
        endPeru.setHours(23, 59, 59, 999);

        const diaries =
            await NutritionalDiaryModel
                .find({
                    patientId,
                    date: {
                        $gte: new Date(startPeru.toISOString()),
                        $lte: new Date(endPeru.toISOString())
                    }
                });

        return diaries.map(
            diary =>
                NutritionalDiaryMapper
                    .toDomain(diary)
        );
    }
}