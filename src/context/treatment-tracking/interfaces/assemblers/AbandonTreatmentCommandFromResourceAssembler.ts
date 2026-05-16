import {AbandonTreatmentResource} from "../resources/AbandonTreatmentResource";
import {AbandonTreatmentCommand} from "../../model/domain/commands/AbandonTreatmentCommand";

export class AbandonTreatmentCommandFromResourceAssembler {

    static toCommand(
        resource: AbandonTreatmentResource
    ): AbandonTreatmentCommand {
        return {
            treatmentId: resource.treatmentId,
            nurseId: resource.nurseId,
            observation: resource.observation
        };
    }
}