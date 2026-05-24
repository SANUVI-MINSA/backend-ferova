import {AchievementQueryService} from "../../domain/services/AchievementQueryService";
import {GetPatientAchievementQuery} from "../../domain/model/queries/GetPatientAchievementQuery";
import {GetPatientBadgesQuery} from "../../domain/model/queries/GetPatientBadgesQuery";

export class AchievementFacade {
    constructor(
        private queryService: AchievementQueryService
    ) {}

    async getPatientAchievement(query: GetPatientAchievementQuery): Promise<any> {
        return this.queryService.getPatientAchievement(query);
    }

    async getPatientBadges(query: GetPatientBadgesQuery): Promise<any> {
        return this.queryService.getPatientBadges(query);
    }
}