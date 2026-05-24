import {Achievement} from "../../../../domain/model/aggregates/Achievement";
import {AchievementMapper} from "../../../mappers/AchievementMapper";
import {AchievementModel} from "../models/AchievementModel";
import {AchievementStatus} from "../../../../domain/model/value-objects/AchievementStatus";
import {AchievementRepository} from "../../../../domain/repositories/AchievementRepository";

export class MongoAchievementRepository implements AchievementRepository {

    async save(achievement: Achievement): Promise<void> {
        const data = AchievementMapper.toPersistence(achievement);
        await AchievementModel.create(data);
    }

    async update(achievement: Achievement): Promise<void> {
        const data = AchievementMapper.toPersistence(achievement);
        await AchievementModel.findOneAndUpdate(
            { id: data.id },
            { $set: data },
            { upsert: false }
        );
    }

    async findById(id: string): Promise<Achievement | null> {
        const document = await AchievementModel.findOne({ id });
        if (!document) return null;
        return AchievementMapper.toDomain(document);
    }

    async findByTreatmentId(treatmentId: string): Promise<Achievement | null> {
        const document = await AchievementModel.findOne({ treatmentId });
        if (!document) return null;
        return AchievementMapper.toDomain(document);
    }

    async findByPatientId(patientId: string): Promise<Achievement | null> {
        const document = await AchievementModel.findOne({ patientId });
        if (!document) return null;
        return AchievementMapper.toDomain(document);
    }

    async findByMotherId(motherId: string): Promise<Achievement[]> {
        const documents = await AchievementModel.find({ motherId });
        return documents.map(doc => AchievementMapper.toDomain(doc));
    }

    async findAllActive(): Promise<Achievement[]> {
        const documents = await AchievementModel.find({
            status: AchievementStatus.ACTIVE
        });
        return documents.map(doc => AchievementMapper.toDomain(doc));
    }

    async delete(id: string): Promise<void> {
        await AchievementModel.findOneAndDelete({ id });
    }
}