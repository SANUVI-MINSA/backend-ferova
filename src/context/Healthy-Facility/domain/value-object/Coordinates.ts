export class Coordinates {

    constructor(
        private readonly lat: number,
        private readonly lng: number
    ) {
        this.validate();
    }

    private validate(): void {
        if (
            this.lat < -90 ||
            this.lat > 90
        ) {
            throw new Error("Invalid latitude");
        }

        if (
            this.lng < -180 ||
            this.lng > 180
        ) {
            throw new Error("Invalid longitude");
        }
    }

    public getLat(): number {
        return this.lat;
    }

    public getLng(): number {
        return this.lng;
    }
}