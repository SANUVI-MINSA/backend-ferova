export type HemoglobinHistoryResource = {
    controls: any[];
    averageHemoglobin: number;
    totalControls: number ;
    evolution: number | null;
    trend: 'UP' | 'DOWN' | 'STABLE' | null;
};