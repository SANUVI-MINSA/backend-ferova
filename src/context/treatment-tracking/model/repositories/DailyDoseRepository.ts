import {DailyDose} from "../domain/entities/DailyDose";

export interface DailyDoseRepository {

    saveMany(
        doses: DailyDose[]
    ): Promise<void>;

    save(
        dose: DailyDose
    ): Promise<void>;

    update(
        dose: DailyDose
    ): Promise<void>;

    findById(
        dailyDoseId: string
    ): Promise<DailyDose | null>;

    findByTreatmentId(
        treatmentId: string
    ): Promise<DailyDose[]>;

    findTodayDose(
        treatmentId: string
    ): Promise<DailyDose | null>;

    findPendingOlderThanHours(
        hours: number
    ): Promise<DailyDose[]>;
}