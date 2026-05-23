import {Badge} from "../model/entities/Badge";
import {BadgeType} from "../model/value-objects/BadgeType";

export interface BadgeRepository {
    save(badge: Badge): Promise<void>;
    saveMany(badges: Badge[]): Promise<void>;
    update(badge: Badge): Promise<void>;
    updateMany(badges: Badge[]): Promise<void>;
    findById(id: string): Promise<Badge | null>;
    findByAchievementId(achievementId: string): Promise<Badge[]>;
    findByAchievementIdAndType(achievementId: string, type: BadgeType): Promise<Badge | null>;
    deleteByAchievementId(achievementId: string): Promise<void>;
}