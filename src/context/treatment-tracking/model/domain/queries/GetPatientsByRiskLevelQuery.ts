import {RiskLevel} from "../value-objects/enum/RiskLevel";

export type GetPatientsByRiskLevelQuery =
    Readonly<{
        riskLevel: RiskLevel;
        nurseId?: string;
    }>;