import {BadgeRepository} from "../../../../domain/repositories/BadgeRepository";
import {Badge} from "../../../../domain/model/entities/Badge";
import {BadgeMapper} from "../../../mappers/BadgeMapper";
import {BadgeModel} from "../models/BadgeModel";
import {BadgeType} from "../../../../domain/model/value-objects/BadgeType";

export class MongoBadgeRepository implements BadgeRepository {

    async save(badge: Badge): Promise<void> {
        const data = BadgeMapper.toPersistence(badge);
        await BadgeModel.create(data);
    }

    async saveMany(badges: Badge[]): Promise<void> {
        const data = badges.map(b => BadgeMapper.toPersistence(b));
        await BadgeModel.insertMany(data);
    }

    async update(badge: Badge): Promise<void> {
        const data = BadgeMapper.toPersistence(badge);
        await BadgeModel.findOneAndUpdate(
            { id: data.id },
            { $set: data },
            { upsert: false }
        );
    }

    async updateMany(badges: Badge[]): Promise<void> {
        const bulkOps = badges.map(badge => ({
            updateOne: {
                filter: { id: badge.getId() },
                update: { $set: BadgeMapper.toPersistence(badge) }
            }
        }));
        await BadgeModel.bulkWrite(bulkOps);
    }

    async findById(id: string): Promise<Badge | null> {
        const document = await BadgeModel.findOne({ id });
        if (!document) return null;
        return BadgeMapper.toDomain(document);
    }

    async findByAchievementId(achievementId: string): Promise<Badge[]> {
        const documents = await BadgeModel.find({ achievementId });
        return documents.map(doc => BadgeMapper.toDomain(doc));
    }

    async findByAchievementIdAndType(
        achievementId: string,
        type: BadgeType
    ): Promise<Badge | null> {
        const document = await BadgeModel.findOne({ achievementId, type });
        if (!document) return null;
        return BadgeMapper.toDomain(document);
    }

    async deleteByAchievementId(achievementId: string): Promise<void> {
        await BadgeModel.deleteMany({ achievementId });
    }
}