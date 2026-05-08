import {RegisterFoodEntryResource} from "../resources/RegisterFoodEntryResource";
import {RegisterFoodEntryCommand} from "../../model/domain/commands/RegisterFoodEntryCommand";

export class RegisterFoodEntryCommandFromResourceAssembler {

    static toCommand(
        resource: RegisterFoodEntryResource
    ): RegisterFoodEntryCommand {

        return {
            patientId:
            resource.patientId,

            motherId:
            resource.motherId,

            foodItemId:
            resource.foodItemId,

            quantity:
            resource.quantity
        };
    }
}