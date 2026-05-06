import {Appointment} from "../../domain/model/entities/Appointment";

export class AppointmentMapper {
    static toDomain(document: any): Appointment {
        return new Appointment(
            document.id,
            document.facilityId,
            document.patientId,
            document.motherId,
            document.nurseId,
            document.date,
            document.status
        )
    }

    static toPersistence(appointment: Appointment) {
        const data = appointment.toPrimitives();

        return {
            id: data.id,
            facilityId: data.facilityId,
            patientId: data.patientId,
            motherId: data.motherId,
            nurseId: data.nurseId,
            date: data.date,
            status: data.status
        }
    }
}