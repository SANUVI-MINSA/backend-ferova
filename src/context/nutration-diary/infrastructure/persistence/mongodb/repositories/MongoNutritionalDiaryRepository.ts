import { NutritionalDiaryRepository } from "../../../../model/repositories/NutritionalDiaryRepository";
import { NutritionalDiary } from "../../../../model/domain/aggregate/NutritionalDiary";
import { Promise } from "mongoose";
import { NutritionalDiaryMapper } from "../../../mappers/NutritionalDiaryMapper";
import { NutritionalDiaryModel } from "../models/NutritionalDiarySchema";

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

    /**
     * ✅ MODIFICADO: Busca el diario del día actual usando UTC
     * Esto asegura consistencia con la fecha usada al crear el diario
     */
    async findTodayByPatientId(
        patientId: string
    ): Promise<NutritionalDiary | null> {

        // ✅ Usar UTC en lugar de Perú
        const now = new Date();
        const startOfDayUTC = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0, 0, 0, 0
        ));
        const endOfDayUTC = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            23, 59, 59, 999
        ));

        console.log(`[MongoNutritionalDiaryRepository] findTodayByPatientId - patientId: ${patientId}`);
        console.log(`[MongoNutritionalDiaryRepository] startOfDayUTC: ${startOfDayUTC.toISOString()}`);
        console.log(`[MongoNutritionalDiaryRepository] endOfDayUTC: ${endOfDayUTC.toISOString()}`);

        const diary =
            await NutritionalDiaryModel
                .findOne({
                    patientId,
                    date: {
                        $gte: startOfDayUTC,
                        $lte: endOfDayUTC
                    }
                });

        if (!diary) {
            console.log(`[MongoNutritionalDiaryRepository] No se encontró diario para patientId: ${patientId}`);
            return null;
        }

        console.log(`[MongoNutritionalDiaryRepository] Diario encontrado: ${diary.id}`);
        return NutritionalDiaryMapper
            .toDomain(diary);
    }

    /**
     * ✅ MODIFICADO: Busca diarios por rango de fechas usando UTC
     */
    async findByPatientAndDateRange(
        patientId: string,
        startDate: Date,
        endDate: Date
    ): Promise<NutritionalDiary[]> {

        // ✅ Usar UTC para consistencia
        const startUTC = new Date(Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate(),
            0, 0, 0, 0
        ));

        const endUTC = new Date(Date.UTC(
            endDate.getUTCFullYear(),
            endDate.getUTCMonth(),
            endDate.getUTCDate(),
            23, 59, 59, 999
        ));

        console.log(`[MongoNutritionalDiaryRepository] findByPatientAndDateRange - patientId: ${patientId}`);
        console.log(`[MongoNutritionalDiaryRepository] startUTC: ${startUTC.toISOString()}`);
        console.log(`[MongoNutritionalDiaryRepository] endUTC: ${endUTC.toISOString()}`);

        const diaries =
            await NutritionalDiaryModel
                .find({
                    patientId,
                    date: {
                        $gte: startUTC,
                        $lte: endUTC
                    }
                });

        console.log(`[MongoNutritionalDiaryRepository] Diarios encontrados: ${diaries.length}`);
        return diaries.map(
            diary =>
                NutritionalDiaryMapper
                    .toDomain(diary)
        );
    }
}