import {GetDashboardSummaryQuery} from "../model/queries/GetDashboardSummaryQuery";
import {GetFacilitiesAnalyticsQuery} from "../model/queries/GetFacilitiesAnalyticsQuery";
import {GetFacilityHeatmapDataQuery} from "../model/queries/GetFacilityHeatmapDataQuery";
import {DashboardSummaryResponseDto} from "../../application/dto/DashboardSummaryResponseDto";
import {FacilitiesAnalyticsResponseDto} from "../../application/dto/FacilityAnalyticsItemDto";
import {HeatmapDataResponseDto} from "../../application/dto/HeatmapPointDto";

export interface AnalyticsQueryService {
    getDashboardSummary(
        query: GetDashboardSummaryQuery
    ): Promise<DashboardSummaryResponseDto>;

    getFacilitiesAnalytics(
        query: GetFacilitiesAnalyticsQuery
    ): Promise<FacilitiesAnalyticsResponseDto>;

    getFacilityHeatmapData(
        query: GetFacilityHeatmapDataQuery
    ): Promise<HeatmapDataResponseDto>;
}