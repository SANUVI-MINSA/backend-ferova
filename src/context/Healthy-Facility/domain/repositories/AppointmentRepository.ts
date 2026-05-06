import {Appointment} from "../model/entities/Appointment";

export interface AppointmentRepository{
    /**
     * Saves the appointment to the repository.
     * @param appointment
     */
    save(
        appointment: Appointment
    ): Promise<Appointment>;

    /**
     * Finds an appointment by its ID.
     * @param id
     */
    /**
    findById(
        id: string
    ): Promise<Appointment | null>;
    **/

    /**
     * Finds an PatientId
     */
    findByPatientId(
        patientId: string
    ): Promise<Appointment[]>;

    /**
     * Finds an appointment by facility id, appointment date and appointment time.
     * It was introduced by the rule that a mother cannot book a date/time already
     * taken by another mother at the same facility.
     * @param facilityId
     * @param appointmentDate
     * @param appointmentTime
     */
    findByFacilityAndDateTime(
        facilityId: string,
        appointmentDate: string,
        appointmentTime: string
    ): Promise<Appointment | null>;

    /**
     * Updates the appointment in the repository.
     * @param appointment
     */
    update(
        appointment: Appointment
    ): Promise<void>
}