export interface GoogleMapsAdapter {

    calculateDistance(
        originLat: number,
        originLng: number,
        destinationLat: number,
        destinationLng: number
    ): Promise<number>;
}