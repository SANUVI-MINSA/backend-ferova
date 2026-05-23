import {Badge} from "../../domain/model/entities/Badge";
import {BadgeType} from "../../domain/model/value-objects/BadgeType";

export class BadgeMapper {
    static toDomain(document: any): Badge {
        return new Badge(
            document.id,
            document.achievementId,
            document.type as BadgeType,
            document.name,
            document.description,
            document.milestone,
            document.isUnlocked,
            document.unlockedAt
        );
    }

    static toPersistence(badge: Badge): any {
        const data = badge.toPrimitives();
        return {
            id: data.id,
            achievementId: data.achievementId,
            type: data.type,
            name: data.name,
            description: data.description,
            milestone: data.milestone,
            isUnlocked: data.isUnlocked,
            unlockedAt: data.unlockedAt
        };
    }
}