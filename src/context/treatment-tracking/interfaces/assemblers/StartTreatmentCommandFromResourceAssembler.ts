import {StartTreatmentResource} from "../resources/StartTreatmentResource";
import {StartTreatmentCommand} from "../../model/domain/commands/StartTreatmentCommand";

export class StartTreatmentCommandFromResourceAssembler {

    static toCommand(
        resource: StartTreatmentResource
    ): StartTreatmentCommand {
        return {
            patientId: resource.patientId,
            nurseId: resource.nurseId,
            supplementName: resource.supplementName,
            quantity: resource.quantity,
            dosingHours: resource.dosingHours,
            durationDays: resource.durationDays
        };
    }
}