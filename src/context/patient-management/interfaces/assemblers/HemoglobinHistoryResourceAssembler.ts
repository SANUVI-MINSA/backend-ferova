export class
HemoglobinHistoryResourceAssembler {

    static toResource(
        data: any
    ) {
        return {
            controls:
            data.controls,
            averageHemoglobin:
            data.averageHemoglobin,
            totalControls:
            data.totalControls
        };
    }
}