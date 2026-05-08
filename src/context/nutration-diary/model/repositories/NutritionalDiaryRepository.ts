import {NutritionalDiary} from "../domain/aggregate/NutritionalDiary";

export interface NutritionalDiaryRepository {

    save(
        diary: NutritionalDiary
    ): Promise<void>;

    update(
        diary: NutritionalDiary
    ): Promise<void>;

    findTodayByPatientId(
        patientId: string
    ): Promise<NutritionalDiary | null>;

    findByPatientAndDateRange(
        patientId: string,
        startDate: Date,
        endDate: Date
    ): Promise<NutritionalDiary[]>;
}