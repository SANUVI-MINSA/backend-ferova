import {AppointmentRepository} from "../../../../domain/repositories/AppointmentRepository";
import {Appointment} from "../../../../domain/model/entities/Appointment";
import {AppointmentMapper} from "../../../mappers/AppointmentMapper";
import {AppointmentModel} from "../models/AppointmentModel";
import moment from 'moment-timezone';

export class MongoAppointmentRepository implements AppointmentRepository {

    // MongoAppointmentRepository.ts
    async findByFacilityAndDateTime(
        facilityId: string,
        appointmentDate: string,
        appointmentTime: string
    ): Promise<Appointment | null> {
        // ✅ Añadir filtro de status: solo buscar CONFIRMADAS
        const appointment = await AppointmentModel.findOne({
            facilityId,
            appointmentDate,
            appointmentTime,
            status: "CONFIRMED"  // ← Esta línea es la clave
        });

        if (!appointment) {
            return null;  // Horario disponible (no hay citas confirmadas)
        }

        return AppointmentMapper.toDomain(appointment);
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

    async findConfirmedByNurseId(
        nurseId: string
    ): Promise<Appointment[]> {

        const appointments =
            await AppointmentModel.find({
                nurseId,
                status: "CONFIRMED"
            });

        return appointments.map(
            appointment =>
                AppointmentMapper
                    .toDomain(appointment)
        );
    }

    async findByFacilityAndDate(
        facilityId: string,
        appointmentDate: string
    ): Promise<Appointment[]> {

        const appointments =
            await AppointmentModel.find({
                facilityId,
                appointmentDate,
                status: "CONFIRMED"
            });

        return appointments.map(
            appointment =>
                AppointmentMapper
                    .toDomain(appointment)
        );
    }

    /**
     * Encuentra la próxima cita confirmada y futura para una madre.
     *
     * @description
     * Reglas de negocio:
     * - Solo considera citas CONFIRMADAS
     * - Solo considera citas con fecha posterior a hoy
     * - Para citas de hoy, solo considera las que aún no han pasado (hora actual < hora de cita)
     * - Retorna la cita más próxima (menor fecha y hora)
     *
     * @param motherId - ID de la madre
     * @returns La próxima cita futura o null si no existe
     */

    async findNextAppointmentByMotherId(
        motherId: string
    ): Promise<Appointment | null> {
        // Obtener fecha y hora actual en zona horaria de Perú
        const nowPeru = moment().tz('America/Lima');
        const today = nowPeru.format('YYYY-MM-DD');
        const currentTime = nowPeru.format('HH:mm');

        console.log(`📍 [findNextAppointmentByMotherId] Hora actual (Perú): ${today} ${currentTime}`);

        const appointment = await AppointmentModel
            .findOne({
                motherId,
                status: "CONFIRMED",
                $or: [
                    // Citas con fecha futura
                    { appointmentDate: { $gt: today } },
                    // Citas de hoy con hora posterior a la actual
                    {
                        appointmentDate: today,
                        appointmentTime: { $gt: currentTime }
                    }
                ]
            })
            .sort({
                appointmentDate: 1,
                appointmentTime: 1
            });

        if (!appointment) return null;
        return AppointmentMapper.toDomain(appointment);
    }
}