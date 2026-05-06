export type RegisterHealthFacilityCommand = Readonly<{
    name: string;
    address: string;
    districtId: string;
    districtName: string;
    latitude: number;
    longitude: number;
    phoneNumber: string;
    services: string[];
    availableDays: string[];
    availableSlots: string[];
    scheduleOfOperation: string;
}>;