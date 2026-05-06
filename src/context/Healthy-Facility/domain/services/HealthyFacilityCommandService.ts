import {BookAppointmentCommand} from "../model/commands/BookAppointmentCommand";
import {AssignNurseToFacilityCommand} from "../model/commands/AssignNurseToFacilityCommand";
import {cancelAppointmentCommand} from "../model/commands/CancelAppointmentCommand";
import {RegisterHealthFacilityCommand} from "../model/commands/RegisterHealthFacilityCommand";

export interface HealthyFacilityCommandService {
    bookAppointment(command: BookAppointmentCommand): Promise<void>;
    assignNurseToFacility(command: AssignNurseToFacilityCommand): Promise<void>;
    cancelAppointment(command: cancelAppointmentCommand): Promise<void>;
    registerFacility(command: RegisterHealthFacilityCommand): Promise<void>;
}