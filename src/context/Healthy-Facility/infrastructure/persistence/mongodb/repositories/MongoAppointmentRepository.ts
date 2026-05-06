import {AppointmentRepository} from "../../../../domain/repositories/AppointmentRepository";
import {Appointment} from "../../../../domain/model/entities/Appointment";
import {AppointmentMapper} from "../../../mappers/AppointmentMapper";
import {AppointmentModel} from "../models/AppointmentModel";

export class MongoAppointmentRepository implements AppointmentRepository {

    async findByFacilityAndDateTime(
        facilityId: string,
        appointmentDate: string,
        appointmentTime: string
    ): Promise<Appointment | null> {

        const appointment =
            await AppointmentModel.findOne({
                facilityId,
                appointmentDate,
                appointmentTime
            });

        if (!appointment) {
            return null;
        }

        return AppointmentMapper
            .toDomain(appointment);
    }

    async findByPatientId(patientId: string): Promise<Appointment[]> {
        const appointments =
            await AppointmentModel.find({
                patientId
            });

        return appointments.map(
            appointments =>
                AppointmentMapper
                    .toDomain(appointments)
        );
    }

    async save(appointment: Appointment): Promise<Appointment> {

        const data =
            AppointmentMapper
                .toPersistence(appointment);

        const createAppointment =
            await AppointmentModel.create(
                data)
        ;

        return AppointmentMapper
            .toDomain(createAppointment);
    }

    async update(appointment: Appointment): Promise<void> {
        const data =
            AppointmentMapper.toPersistence(appointment);

        await AppointmentModel.updateOne(
            {
                id: data.id,
            },
            data
        )
    }

    async findById(
        id: string
    ): Promise<Appointment | null> {

        const appointment =
            await AppointmentModel.findOne({
                id
            });

        if (!appointment) {
            return null;
        }

        return AppointmentMapper
            .toDomain(appointment);
    }


}