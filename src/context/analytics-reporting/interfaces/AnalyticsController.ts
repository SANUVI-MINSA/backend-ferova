import {AnalyticsQueryService} from "../domain/services/AnalyticsQueryService";
import { Request, Response } from "express";
import {AuthRequest} from "../../../middlewares/auth.middleware";

export class AnalyticsController {

    constructor(
        private analyticsQueryService: AnalyticsQueryService
    ) {}

    getDashboardSummary = async (req: AuthRequest, res: Response) => {
        try {
            const result = await this.analyticsQueryService.getDashboardSummary({});
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getFacilitiesAnalytics = async (req: AuthRequest, res: Response) => {
        try {
            const riskLevelFilter = req.query.riskLevel as "LOW" | "MEDIUM" | "HIGH" | undefined;

            const result = await this.analyticsQueryService.getFacilitiesAnalytics({
                riskLevelFilter
            });
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getFacilityHeatmapData = async (req: AuthRequest, res: Response) => {
        try {
            const riskLevelFilter = req.query.riskLevel as "LOW" | "MEDIUM" | "HIGH" | undefined;

            const result = await this.analyticsQueryService.getFacilityHeatmapData({
                riskLevelFilter
            });
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getTopFacilities = async (req: AuthRequest, res: Response) => {
        try {
            const result = await this.analyticsQueryService.getTopFacilities({});
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

}