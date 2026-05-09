import {StartConsultationResource} from "../resources/StartConsultationResource";
import {StartConsultationCommand} from "../../domain/model/commands/StartConsultationCommand";

export class StartConsultationCommandFromResourceAssembler {

    static toCommand(
        resource: StartConsultationResource
    ): StartConsultationCommand {

        return {
            motherId:
            resource.motherId,

            patientId:
            resource.patientId,

            firstMessageContent:
            resource.firstMessageContent
        };
    }
}