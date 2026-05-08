import {IronCalculatorService} from "../../model/services/IronCalculatorService";

export class IronCalculatorServiceImpl
    implements IronCalculatorService {

    calculateIronAbsorption(
        ironMg: number,
        quantity: number,
        ironType: string
    ): number {

        if (ironMg < 0) {
            throw new Error(
                "Iron amount cannot be negative"
            );
        }

        if (quantity <= 0) {
            throw new Error(
                "Quantity must be greater than zero"
            );
        }

        const totalIron =
            (ironMg / 100) * quantity;

        let absorbedIron = 0;

        if (ironType === "hemo") {
            absorbedIron =
                totalIron * 0.25;
        } else if (
            ironType === "no-hemo"
        ) {
            absorbedIron =
                totalIron * 0.05;
        } else {
            throw new Error(
                "Invalid iron type"
            );
        }

        return Number(
            absorbedIron.toFixed(2)
        );
    }
}