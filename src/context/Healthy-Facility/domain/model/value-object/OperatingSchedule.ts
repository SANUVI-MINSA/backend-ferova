export class OperatingSchedule {

    constructor(
        private readonly availableDays: string[],
        private readonly availableSlots: string[]
    ) {
        if (
            availableDays.length === 0
        ) {
            throw new Error(
                "Available days required"
            );
        }

        if (
            availableSlots.length === 0
        ) {
            throw new Error(
                "Available slots required"
            );
        }
    }

    public toPrimitives() {
        return {
            availableDays:
            this.availableDays,
            availableSlots:
            this.availableSlots
        };
    }
}