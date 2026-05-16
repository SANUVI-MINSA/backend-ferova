import {EvaluateMissedDoseResource} from "../resources/EvaluateMissedDoseResource";
import {EvaluateMissedDoseCommand} from "../../model/domain/commands/EvaluateMissedDoseCommand";

export class EvaluateMissedDoseCommandFromResourceAssembler {

    static toCommand(
        resource: EvaluateMissedDoseResource
    ): EvaluateMissedDoseCommand {
        return {
            dailyDoseId: resource.dailyDoseId
        };
    }
}