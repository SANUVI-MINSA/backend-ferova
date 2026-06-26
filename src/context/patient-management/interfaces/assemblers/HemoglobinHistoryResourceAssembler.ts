export class
HemoglobinHistoryResourceAssembler {

    static toResource(
        data: any
    ) {
        return {
            patientId: data.patientId,
            patientName: data.patientName,
            controls:
            data.controls,
            averageHemoglobin:
            data.averageHemoglobin,
            totalControls:
            data.totalControls,
            evolution: data.evolution,
            trend: data.trend
        };
    }
}