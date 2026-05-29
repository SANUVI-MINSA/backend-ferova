import {AnalyticsQueryService} from "../../domain/services/AnalyticsQueryService";
import {MongoAnalyticsRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoAnalyticsRepository";
import {GetDashboardSummaryQuery} from "../../domain/model/queries/GetDashboardSummaryQuery";
import {DashboardSummaryResponseDto} from "../dto/DashboardSummaryResponseDto";
import {GetFacilitiesAnalyticsQuery} from "../../domain/model/queries/GetFacilitiesAnalyticsQuery";
import {FacilitiesAnalyticsResponseDto} from "../dto/FacilityAnalyticsItemDto";
import {GetFacilityHeatmapDataQuery} from "../../domain/model/queries/GetFacilityHeatmapDataQuery";
import {HeatmapDataResponseDto} from "../dto/HeatmapPointDto";
import {GetTopFacilitiesQuery} from "../../domain/model/queries/GetTopFacilitiesQuery";
import {TopFacilitiesResponseDto} from "../dto/TopFacilitiesResponseDto";

export class AnalyticsQueryServiceImpl implements AnalyticsQueryService {

    constructor(
        private analyticsRepository: MongoAnalyticsRepository
    ) {}

    async getDashboardSummary(
        query: GetDashboardSummaryQuery
    ): Promise<DashboardSummaryResponseDto> {
        return await this.analyticsRepository.getDashboardSummary();
    }

    async getFacilitiesAnalytics(
        query: GetFacilitiesAnalyticsQuery
    ): Promise<FacilitiesAnalyticsResponseDto> {
        return await this.analyticsRepository.getFacilitiesAnalytics(query.riskLevelFilter);
    }

    async getFacilityHeatmapData(
        query: GetFacilityHeatmapDataQuery
    ): Promise<HeatmapDataResponseDto> {
        return await this.analyticsRepository.getFacilityHeatmapData(query.riskLevelFilter);
    }

    async getTopFacilities(
        query: GetTopFacilitiesQuery
    ): Promise<TopFacilitiesResponseDto> {
        return await this.analyticsRepository.getTopFacilities();
    }
}