import {Appointment} from "../../domain/model/entities/Appointment";
import {MotherNextAppointmentResource} from "../resources/MotherNextAppointmentResource";

export class
MotherNextAppointmentResourceAssembler {

    static toResource(
        item: any
    ): MotherNextAppointmentResource {

        const data =
            item.appointment
                .toPrimitives();

        return {
            appointmentId:
            data.id,

            appointmentDate:
            data.appointmentDate,

            appointmentTime:
            data.appointmentTime,

            patientId:
            data.patientId,

            facilityName:
            item.facilityName,

            status:
            data.status
        };
    }
}