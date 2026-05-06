import {GoogleMapsAdapter} from "../../application/internal/outbound-services/GoogleMapsAdapter";

export class GoogleMapsService
    implements GoogleMapsAdapter {

    async calculateDistance(
        originLat: number,
        originLng: number,
        destinationLat: number,
        destinationLng: number
    ): Promise<number> {

        const earthRadiusKm = 6371;

        const dLat =
            this.toRadians(
                destinationLat - originLat
            );

        const dLng =
            this.toRadians(
                destinationLng - originLng
            );

        const a =
            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +

            Math.cos(
                this.toRadians(originLat)
            ) *

            Math.cos(
                this.toRadians(destinationLat)
            ) *

            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        const distance =
            earthRadiusKm * c;

        return Number(
            distance.toFixed(2)
        );
    }

    private toRadians(
        degrees: number
    ): number {
        return degrees *
            (Math.PI / 180);
    }
}