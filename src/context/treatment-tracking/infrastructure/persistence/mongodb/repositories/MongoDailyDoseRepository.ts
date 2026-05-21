import {DailyDoseRepository} from "../../../../model/repositories/DailyDoseRepository";
import {DailyDose} from "../../../../model/domain/entities/DailyDose";
import {Promise} from "mongoose";
import {DailyDoseMapper} from "../../../mappers/DailyDoseMapper";
import {DailyDoseModel} from "../models/DailyDoseModel";
import {DoseStatus} from "../../../../model/domain/value-objects/enum/DoseStatus";

export class MongoDailyDoseRepository
    implements DailyDoseRepository {

    async findById(
        dailyDoseId: string
    ): Promise<DailyDose | null> {

        const dose =
            await DailyDoseModel
                .findOne({
                    id: dailyDoseId
                });

        if (!dose) {
            return null;
        }

        return DailyDoseMapper
            .toDomain(dose);
    }

    async findByTreatmentId(
        treatmentId: string
    ): Promise<DailyDose[]> {

        const doses =
            await DailyDoseModel
                .find({
                    treatmentId
                });

        return doses.map(
            d =>
                DailyDoseMapper
                    .toDomain(d)
        );
    }

    // En MongoDailyDoseRepository.ts
    async findPendingOlderThanHours(hours: number): Promise<DailyDose[]> {
        const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

        const doses = await DailyDoseModel.find({
            status: DoseStatus.PENDING,
            scheduledDate: { $lte: threshold }
        });

        return doses.map(d => DailyDoseMapper.toDomain(d));
    }

    async findTodayDose(
        treatmentId: string
    ): Promise<DailyDose | null> {

        const today =
            new Date();

        const start =
            new Date(today);
        start.setHours(
            0,0,0,0
        );

        const end =
            new Date(today);
        end.setHours(
            23,59,59,999
        );

        const dose =
            await DailyDoseModel
                .findOne({
                    treatmentId,
                    scheduledDate: {
                        $gte: start,
                        $lte: end
                    }
                });

        if (!dose) {
            return null;
        }

        return DailyDoseMapper
            .toDomain(dose);
    }

    async save(
        dose: DailyDose
    ): Promise<void> {

        await DailyDoseModel
            .create(
                DailyDoseMapper
                    .toPersistence(
                        dose
                    )
            );
    }

    async saveMany(
        doses: DailyDose[]
    ): Promise<void> {

        const mapped =
            doses.map(
                dose =>
                    DailyDoseMapper
                        .toPersistence(
                            dose
                        )
            );

        await DailyDoseModel
            .insertMany(mapped);
    }

    async update(
        dose: DailyDose
    ): Promise<void> {

        const data =
            DailyDoseMapper
                .toPersistence(
                    dose
                );

        await DailyDoseModel
            .findOneAndUpdate(
                { id: data.id },
                data
            );
    }

    async delete(dailyDoseId: string): Promise<void> {
        await DailyDoseModel.findOneAndDelete({ id: dailyDoseId });
    }

    async deleteMany(dailyDoseIds: string[]): Promise<void> {
        await DailyDoseModel.deleteMany({ id: { $in: dailyDoseIds } });
    }

}