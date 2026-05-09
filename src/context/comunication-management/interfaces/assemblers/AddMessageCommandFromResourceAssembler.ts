import {AddMessageResource} from "../resources/AddMessageResource";
import {AddMessageCommand} from "../../domain/model/commands/AddMessageCommand";

export class AddMessageCommandFromResourceAssembler {

    static toCommand(
        resource: AddMessageResource
    ): AddMessageCommand {

        return {
            consultationId:
            resource.consultationId,

            senderId:
            resource.senderId,

            senderRole:
                resource.senderRole as any,

            content:
            resource.content
        };
    }
}