import mongoose from 'mongoose'

const healthFacilitySchema =
    new mongoose.Schema(
        {
            id: {
                type: String,
                required: true,
                unique: true
            },

            name: {
                type: String,
                required: true
            },

            address: {
                type: String,
                required: true
            },

            districtId: {
                type: String,
                required: true
            },

            districtName: {
                type: String,
                required: true
            },

            coordinates: {
                lat: {
                    type: Number,
                    required: true
                },

                lng: {
                    type: Number,
                    required: true
                }
            },

            phoneNumber: {
                type: String,
                required: true
            },

            services: [
                {
                    type: String
                }
            ],

            operatingSchedule: {
                availableDays: [
                    {
                        type: String
                    }
                ],

                availableSlots: [
                    {
                        type: String
                    }
                ]
            },

            scheduleOfOperation: {
                type: String,
                required: true
            },

            status: {
                type: String,
                required: true
            }
        },
        {
            timestamps: true
        }
    );


export const HealthFacilityModel =
    mongoose.model(
        'HealthFacility',
        healthFacilitySchema
    );