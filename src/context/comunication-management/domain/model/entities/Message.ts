import {MessageSender} from "../enum/MessageSender";

export class Message {

    constructor(
        private id: string,
        private senderId: string,
        private senderRole: MessageSender,
        private content: string,
        private sentAt: Date
    ) {
        this.validate();
    }

    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Message id is required"
            );
        }

        if (!this.senderId) {
            throw new Error(
                "Sender id is required"
            );
        }

        if (!this.senderRole) {
            throw new Error(
                "Sender role is required"
            );
        }

        if (
            !this.content ||
            this.content.trim() === ""
        ) {
            throw new Error(
                "Message content cannot be empty"
            );
        }

        if (!this.sentAt) {
            throw new Error(
                "Message sent date is required"
            );
        }
    }

    getId(): string {
        return this.id;
    }

    getSenderId(): string {
        return this.senderId;
    }

    getSenderRole(): MessageSender {
        return this.senderRole;
    }

    getContent(): string {
        return this.content;
    }

    getSentAt(): Date {
        return this.sentAt;
    }

    toPrimitives() {
        return {
            id: this.id,
            senderId: this.senderId,
            senderRole:
            this.senderRole,
            content:
            this.content,
            sentAt:
            this.sentAt
        };
    }
}