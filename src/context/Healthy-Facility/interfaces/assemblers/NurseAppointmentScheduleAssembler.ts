import {Appointment} from "../../domain/model/entities/Appointment";

export class NurseAppointmentScheduleAssembler {

    static toResource(
        appointment: Appointment,
        patientName: string
    ) {
        const data =
            appointment.toPrimitives();

        return {
            appointmentId:
            data.id,
            patientId:
            data.patientId,
            patientName: patientName,
            appointmentDate:
            data.appointmentDate,
            appointmentTime:
            data.appointmentTime,
            status:
            data.status
        };
    }
}