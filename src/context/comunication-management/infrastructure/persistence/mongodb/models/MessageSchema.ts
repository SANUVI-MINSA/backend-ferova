import mongoose from "mongoose";

const MessageSchema =
    new mongoose.Schema(
        {
            id: {
                type: String,
                required: true
            },

            senderId: {
                type: String,
                required: true
            },

            senderRole: {
                type: String,
                required: true
            },

            content: {
                type: String,
                required: true
            },

            sentAt: {
                type: Date,
                required: true
            }
        },
        {
            _id: false
        }
    );

export {MessageSchema}