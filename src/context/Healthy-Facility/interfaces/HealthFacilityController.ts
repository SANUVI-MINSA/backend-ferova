import { Request, Response } from "express";
import {HealthFacilityFacade} from "./acl/facade/HealthyFacilityFacade";
import {HealthFacilityDetailResourceAssembler} from "./assemblers/HealthFacilityDetailResourceAssembler";
import {AppointmentHistoryResourceAssembler} from "./assemblers/AppointmentHistoryResourceAssembler";
import {NurseAppointmentScheduleAssembler} from "./assemblers/NurseAppointmentScheduleAssembler";
import {MotherNextAppointmentResourceAssembler} from "./assemblers/MotherNextAppointmentResourceAssembler";

export class HealthFacilityController {

    constructor(
        private healthFacilityFacade:
        HealthFacilityFacade
    ) {}

    registerHealthFacility = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this
                .healthFacilityFacade
                .registerHealthFacility(
                    req.body
                );

            res.status(201).json({
                message:
                    "Health facility registered successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    assignNurseToFacility = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this
                .healthFacilityFacade
                .assignNurseToFacility(
                    req.body
                );

            res.status(200).json({
                message:
                    "Nurse assigned successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    bookAppointment = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this
                .healthFacilityFacade
                .bookAppointment(
                    req.body
                );

            res.status(201).json({
                message:
                    "Appointment booked successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    cancelAppointment = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this
                .healthFacilityFacade
                .cancelAppointment(
                    req.body
                );

            res.status(200).json({
                message:
                    "Appointment cancelled successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    getHealthFacilityDetail = async (
        req: Request,
        res: Response
    ) => {
        try {
            const facilityId = this.getStringParam(req.params.id);

            if (!facilityId) {
                return res.status(400).json({ error: "Facility ID is required" });
            }

            const facility =
                await this
                    .healthFacilityFacade
                    .getHealthFacilityDetail({
                        facilityId
                    });

            if (!facility) {
                return res.status(404).json({
                    error:
                        "Health facility not found"
                });
            }

            const response =
                HealthFacilityDetailResourceAssembler
                    .toResource(
                        facility
                    );

            res.status(200).json(
                response
            );

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getPatientAppointmentHistory =
        async (
            req: Request,
            res: Response
        ) => {
            try {

                const patientId = this.getStringParam(req.params.patientId);

                if (!patientId) {
                    return res.status(400).json({ error: "Patient ID is required" });
                }

                const appointments =
                    await this
                        .healthFacilityFacade
                        .getPatientAppointmentHistory({
                            patientId
                        });

                const response =
                    appointments.map(
                        item =>
                            AppointmentHistoryResourceAssembler
                                .toResource(
                                    item
                                )
                    );

                res.status(200).json(
                    response
                );

            } catch (error: any) {
                res.status(400).json({
                    error:
                    error.message
                });
            }
        };

    listHealthFacilities = async (req: Request, res: Response) => {
        try {
            // Cambiar de 'latitude'/'longitude' a 'lat'/'lng'
            const latitude = parseFloat(String(req.query.lat ?? ''));
            const longitude = parseFloat(String(req.query.lng ?? ''));

            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({
                    error: "Both 'lat' and 'lng' query parameters are required (e.g., ?lat=-12.0464&lng=-77.0428)"
                });
            }


            const facilities = await
                this.healthFacilityFacade.listHealthFacilities({
                    userLatitude: latitude,
                    userLongitude: longitude
            });

            const response = facilities.map((item: any) => {
                const data = item.facility.toPrimitives();
                return {
                    id: data.id,
                    name: data.name,
                    status: data.status,
                    distanceKm: item.distanceKm
                };
            });

            res.status(200).json(response);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getNurseAppointmentSchedule =
        async (
            req: Request,
            res: Response
        ) => {
            try {

                const nurseId = this.getStringParam(req.params.nurseId);

                if (!nurseId) {
                    return res.status(400).json({ error: "Nurse ID is required" });
                }                const appointments =
                    await this
                        .healthFacilityFacade
                        .getNurseAppointmentSchedule({
                            nurseId
                        });

                const response =
                    appointments.map(
                        appointment =>
                            NurseAppointmentScheduleAssembler
                                .toResource(
                                    appointment
                                )
                    );

                res.status(200).json(
                    response
                );

            } catch (error: any) {
                res.status(400).json({
                    error:
                    error.message
                });
            }
        };

    getFacilityAvailableSlots = async (
        req: Request,
        res: Response
    ) => {
        try {

            const facilityId = this.getStringParam(req.params.facilityId);
            const appointmentsdate = this.getStringParam(req.params.appointmentsDate);


            if (!facilityId) {
                return res.status(400).json({ error: "Facility ID is required" });
            }

            if (!appointmentsdate) {
                return res.status(400).json({ error: "Appointment date is required" });
            }

            const slots =
                await this
                    .healthFacilityFacade
                    .getFacilityAvailableSlots({
                        facilityId,

                        appointmentDate: appointmentsdate
                    });

            res.status(200).json(
                slots
            );

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getMotherNextAppointment = async (
        req: Request,
        res: Response
    ) => {
        try {

            const motherId = this.getStringParam(req.params.motherId);

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID is required" });
            }

            const appointment =
                await this
                    .healthFacilityFacade
                    .getMotherNextAppointment({
                        motherId
                    });

            if (!appointment) {
                return res.status(404).json({
                    message:
                        "No upcoming appointments found"
                });
            }

            const response =
                MotherNextAppointmentResourceAssembler
                    .toResource(
                        appointment
                    );

            res.status(200).json(
                response
            );

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    // Ayuda a manejar parámetros que pueden ser string o array de strings (en caso de múltiples valores)
    private getStringParam(param: string | string[] | undefined): string | undefined {
        if (!param) return undefined;
        return Array.isArray(param) ? param[0] : param;
    }


}