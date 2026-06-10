import { Request, Response } from "express";
import {HealthFacilityFacade} from "./acl/facade/HealthyFacilityFacade";
import {HealthFacilityDetailResourceAssembler} from "./assemblers/HealthFacilityDetailResourceAssembler";
import {AppointmentHistoryResourceAssembler} from "./assemblers/AppointmentHistoryResourceAssembler";
import {NurseAppointmentScheduleAssembler} from "./assemblers/NurseAppointmentScheduleAssembler";
import {MotherNextAppointmentResourceAssembler} from "./assemblers/MotherNextAppointmentResourceAssembler";
import {AuthRequest} from "../../../middlewares/auth.middleware";
import {DistrictRepository} from "../../../shared/catalogs/district/DistrictRepository";

export class HealthFacilityController {

    constructor(
        private healthFacilityFacade:
        HealthFacilityFacade,
        private districtRepository:
        DistrictRepository
    ) {}

    registerHealthFacility = async (req: AuthRequest, res: Response) => {
        try {

            await this.healthFacilityFacade.registerHealthFacility(req.body);

            res.status(201).json({
                message: "Health facility registered successfully"
            });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    assignNurseToFacility = async (req: AuthRequest, res: Response) => {
        try {

            await this.healthFacilityFacade.assignNurseToFacility(req.body);

            res.status(200).json({
                message: "Nurse assigned successfully"
            });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };


    bookAppointment = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const { facilityId, patientId, appointmentDate, appointmentTime } = req.body;

            if (!facilityId || !patientId || !appointmentDate || !appointmentTime) {
                return res.status(400).json({
                    error: "Faltan campos requeridos: facilityId, patientId, appointmentDate, appointmentTime"
                });
            }

            // Validar que el paciente pertenece a esta madre
            await this.healthFacilityFacade.validatePatientBelongsToMother(patientId, motherId);

            const command = {
                facilityId,
                patientId,
                motherId,  // ← Del token
                appointmentDate,
                appointmentTime
            };

            await this.healthFacilityFacade.bookAppointment(command);

            res.status(201).json({ message: "Appointment booked successfully" });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    cancelAppointment = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const { appointmentId } = req.body;

            if (!appointmentId) {
                return res.status(400).json({ error: "Appointment ID es requerido" });
            }

            // Validar que la cita pertenece a esta madre
            await this.healthFacilityFacade.validateAppointmentBelongsToMother(appointmentId, motherId);

            const command = { appointmentId };
            await this.healthFacilityFacade.cancelAppointment(command);

            res.status(200).json({ message: "Appointment cancelled successfully" });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
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

    getPatientAppointmentHistory = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId as string;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const patientId = req.params.patientId as string;

            if (!patientId) {
                return res.status(400).json({ error: "Patient ID es requerido" });
            }

            // Validar que el paciente pertenece a esta madre
            await this.healthFacilityFacade.validatePatientBelongsToMother(patientId, motherId);

            const appointments = await this.healthFacilityFacade.getPatientAppointmentHistory({ patientId });

            const response = appointments.map(item => AppointmentHistoryResourceAssembler.toResource(item));

            res.status(200).json(response);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    listHealthFacilities = async (req: AuthRequest, res: Response) => {
        try {

            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({
                    error: "Mother ID no encontrado en el token"
                });
            }

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
                    userLongitude: longitude,
                    motherId: motherId
                });

            const response = facilities.map((item: any) => {
                const data = item.facility.toPrimitives();
                return {
                    id: data.id,
                    name: data.name,
                    status: data.status,
                    distanceKm: item.distanceKm,
                    latitude: data.coordinates.lat,
                    longitude: data.coordinates.lng
                };
            });

            res.status(200).json(response);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getNurseAppointmentSchedule = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const enrichedAppointments = await this.healthFacilityFacade.getNurseAppointmentSchedule({
                nurseId
            });

            const response = enrichedAppointments.map(item =>
                NurseAppointmentScheduleAssembler.toResource(item.appointment, item.patientName)
            );

            res.status(200).json(response);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getFacilityAvailableSlots = async (
        req: Request,
        res: Response
    ) => {
        try {

            const facilityId = this.getStringParam(req.params.facilityId);
            const appointmentDate = this.getStringParam(req.query.date as string);


            if (!facilityId) {
                return res.status(400).json({ error: "Facility ID is required" });
            }

            if (!appointmentDate) {
                return res.status(400).json({ error: "Appointment date is required" });
            }

            const slots =
                await this
                    .healthFacilityFacade
                    .getFacilityAvailableSlots({
                        facilityId,

                        appointmentDate: appointmentDate
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

    getMotherNextAppointment = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const appointment = await this.healthFacilityFacade.getMotherNextAppointment({ motherId });

            if (!appointment) {
                return res.status(404).json({ message: "No upcoming appointments found" });
            }

            const response = MotherNextAppointmentResourceAssembler.toResource(appointment);

            res.status(200).json(response);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    listUnassignedNurses = async (req: AuthRequest, res: Response) => {
        try {
            const nurses = await this.healthFacilityFacade.listUnassignedNurses({});

            res.status(200).json({
                success: true,
                data: nurses
            });

        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };

    listDistricts = async (req: AuthRequest, res: Response) => {
        try {
            const districts = this.districtRepository.findAll();
            const response = districts.map(district => ({
                id: district.getId(),
                name: district.getName()
            }));
            res.status(200).json(response);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    /**
     * Verifica si hay enfermeros disponibles para asignar a una nueva posta
     */
    canRegisterFacility = async (req: AuthRequest, res: Response) => {
        try {
            const result = await this.healthFacilityFacade.canRegisterFacility();
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    /**
     * Lista todas las postas con información de asignación (para admin)
     */
    listAllHealthFacilities = async (req: AuthRequest, res: Response) => {
        try {
            const result = await this.healthFacilityFacade.listAllHealthFacilities();
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };


    // Ayuda a manejar parámetros que pueden ser string o array de strings (en caso de múltiples valores)
    private getStringParam(param: string | string[] | undefined): string | undefined {
        if (!param) return undefined;
        return Array.isArray(param) ? param[0] : param;
    }


}