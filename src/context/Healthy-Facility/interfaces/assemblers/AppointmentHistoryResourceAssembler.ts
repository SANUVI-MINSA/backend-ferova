import {AppointmentHistoryResource} from "../resources/AppointmentHistoryResource";

export class
AppointmentHistoryResourceAssembler {

    static toResource(
        item: any
    ): AppointmentHistoryResource {

        const data =
            item.appointment
                .toPrimitives();

        return {
            appointmentId:
            data.id,

            facilityName:
            item.facilityName,

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