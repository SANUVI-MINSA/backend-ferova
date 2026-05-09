import {MessageSender} from "../enum/MessageSender";

export type AddMessageCommand =
    Readonly<{
        consultationId: string;
        senderId: string;
        senderRole: MessageSender;
        content: string;
    }>;