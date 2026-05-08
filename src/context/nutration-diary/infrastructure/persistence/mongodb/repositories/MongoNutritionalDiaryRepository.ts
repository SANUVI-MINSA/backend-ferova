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

        // 🔧 SOLUCIÓN: Usar la fecha actual en la zona horaria de Perú (UTC-5)
        const now = new Date();

        // Crear fecha para Perú (UTC-5)
        const peruDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));

        // Obtener inicio del día en Perú (00:00:00)
        const startOfDayPeru = new Date(peruDate);
        startOfDayPeru.setHours(0, 0, 0, 0);

        // Obtener fin del día en Perú (23:59:59.999)
        const endOfDayPeru = new Date(peruDate);
        endOfDayPeru.setHours(23, 59, 59, 999);

        // Convertir a UTC para la búsqueda en MongoDB
        const startUTC = new Date(startOfDayPeru.toISOString());
        const endUTC = new Date(endOfDayPeru.toISOString());

        console.log("🔍 Buscando diary para:", {
            patientId,
            startUTC,
            endUTC,
            horaPeru: peruDate.toLocaleString("es-PE")
        });

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
            console.log("❌ No se encontró diary para hoy");
            return null;
        }

        console.log("✅ Diary encontrado:", diary.date);
        return NutritionalDiaryMapper
            .toDomain(diary);
    }

    async findByPatientAndDateRange(
        patientId: string,
        startDate: Date,
        endDate: Date
    ): Promise<NutritionalDiary[]> {

        // Asegurar que las fechas están normalizadas a Perú
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