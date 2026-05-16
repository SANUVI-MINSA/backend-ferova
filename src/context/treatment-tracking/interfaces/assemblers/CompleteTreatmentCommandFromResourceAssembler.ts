import {CompleteTreatmentResource} from "../resources/CompleteTreatmentResource";
import {CompleteTreatmentCommand} from "../../model/domain/commands/CompleteTreatmentCommand";

export class CompleteTreatmentCommandFromResourceAssembler {

    static toCommand(
        resource: CompleteTreatmentResource
    ): CompleteTreatmentCommand {
        return {
            treatmentId: resource.treatmentId,
            nurseId: resource.nurseId,
            observation: resource.observation
        };
    }
}