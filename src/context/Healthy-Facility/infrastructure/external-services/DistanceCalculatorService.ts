export class DistanceCalculatorService {

    static calculateDistanceKm(
        userLat: number,
        userLng: number,
        facilityLat: number,
        facilityLng: number
    ): number {

        const toRadians = (
            value: number
        ): number => {
            return value * (
                Math.PI / 180
            );
        };

        const earthRadiusKm = 6371;

        const deltaLat =
            toRadians(
                facilityLat - userLat
            );

        const deltaLng =
            toRadians(
                facilityLng - userLng
            );

        const a =
            Math.sin(
                deltaLat / 2
            ) *
            Math.sin(
                deltaLat / 2
            ) +

            Math.cos(
                toRadians(userLat)
            ) *

            Math.cos(
                toRadians(facilityLat)
            ) *

            Math.sin(
                deltaLng / 2
            ) *

            Math.sin(
                deltaLng / 2
            );

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
}