import {FacilityAnalyticsItemDto} from "./FacilityAnalyticsItemDto";

export class TopFacilitiesResponseDto {
    constructor(
        public readonly facilities: FacilityAnalyticsItemDto[]
    ) {}
}