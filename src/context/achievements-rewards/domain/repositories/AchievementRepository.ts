import {Achievement} from "../model/aggregates/Achievement";

export interface AchievementRepository {
    save(achievement: Achievement): Promise<void>;
    update(achievement: Achievement): Promise<void>;
    findById(id: string): Promise<Achievement | null>;
    findByTreatmentId(treatmentId: string): Promise<Achievement | null>;
    findByPatientId(patientId: string): Promise<Achievement | null>;
    findByMotherId(motherId: string): Promise<Achievement[]>;
    findAllActive(): Promise<Achievement[]>;
}