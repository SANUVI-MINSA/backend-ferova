import {Appointment} from "../../domain/model/entities/Appointment";

export class NurseAppointmentScheduleAssembler {

    static toResource(
        appointment: Appointment
    ) {
        const data =
            appointment.toPrimitives();

        return {
            appointmentId:
            data.id,
            patientId:
            data.patientId,
            appointmentDate:
            data.appointmentDate,
            appointmentTime:
            data.appointmentTime,
            status:
            data.status
        };
    }
}