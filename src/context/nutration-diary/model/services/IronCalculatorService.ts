export interface IronCalculatorService {

    calculateIronAbsorption(
        ironMg: number,
        quantity: number,
        ironType: string
    ): number;
}