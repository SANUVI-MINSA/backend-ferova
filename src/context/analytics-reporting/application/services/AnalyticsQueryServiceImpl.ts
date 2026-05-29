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
import {PdfReportService} from "./PdfReportService";
import {GeneratePdfReportQuery} from "../../domain/model/queries/GeneratePdfReportQuery";
import {PdfReportResponseDto} from "../dto/PdfReportResponseDto";

export class AnalyticsQueryServiceImpl implements AnalyticsQueryService {

    private pdfReportService: PdfReportService;

    constructor(
        private analyticsRepository: MongoAnalyticsRepository
    ) {
        this.pdfReportService = new PdfReportService();
    }

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

    async generatePdfReport(
        query: GeneratePdfReportQuery
    ): Promise<PdfReportResponseDto> {
        // Obtener datos
        const summary = await this.analyticsRepository.getDashboardSummary();
        const facilitiesResponse = await this.analyticsRepository.getFacilitiesAnalytics(undefined);

        // Generar PDF
        const pdfBuffer = await this.pdfReportService.generateFacilitiesReport(
            summary,
            facilitiesResponse.facilities
        );

        // Convertir a base64
        const pdfBase64 = pdfBuffer.toString('base64');

        return new PdfReportResponseDto(
            pdfBase64,
            `reporte_postas_${new Date().toISOString().split('T')[0]}.pdf`
        );
    }

}