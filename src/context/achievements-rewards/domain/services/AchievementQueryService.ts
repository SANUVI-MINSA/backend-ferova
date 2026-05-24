import {GetPatientAchievementQuery} from "../model/queries/GetPatientAchievementQuery";
import {GetPatientBadgesQuery} from "../model/queries/GetPatientBadgesQuery";

export interface AchievementQueryService {
    getPatientAchievement(query: GetPatientAchievementQuery): Promise<any>;
    getPatientBadges(query: GetPatientBadgesQuery): Promise<any>;
}