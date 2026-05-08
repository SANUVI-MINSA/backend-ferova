import {RegisterFoodEntryCommand} from "../domain/commands/RegisterFoodEntryCommand";

export interface NutritionalDiaryCommandService {

    registerFoodEntry(
        command: RegisterFoodEntryCommand
    ): Promise<any>;

    validatePatientBelongsToMother(
        patientId: string,
        motherId: string
    ): Promise<void>;
}