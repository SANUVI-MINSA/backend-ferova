export type HemoglobinHistoryResource = {
    patientId: string;
    patientName: string;
    controls: any[];
    averageHemoglobin: number;
    totalControls: number ;
    evolution: number | null;
    trend: 'UP' | 'DOWN' | 'STABLE' | null;
};