import {DailyDose} from "../../model/domain/entities/DailyDose";


export class DailyDoseMapper {

    static toDomain(
        document: any
    ): DailyDose {

        return new DailyDose(
            document.id,
            document.treatmentId,
            document.scheduledDate,
            document.confirmedAt,
            document.status
        );
    }

    static toPersistence(
        dose: DailyDose
    ) {
        return dose
            .toPrimitives();
    }
}