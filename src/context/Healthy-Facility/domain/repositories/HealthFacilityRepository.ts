import {HealthFacility} from "../model/aggregate/HealthFacility";

export interface HealthyFacilityRepository {
    /**
     * Saves the health facility to the repository.
     * @param facility
     */
    save(
        facility: HealthFacility
    ): Promise<HealthFacility>

    /**
     * Finds a health facility by its ID.
     * @param id
     */
    findById(
        id: string
    ): Promise<HealthFacility | null>

    /**
     * Finds all health facilities in the repository
     */
    findAll(): Promise<HealthFacility[]>

    /**
     * Finds all active health facilities in the repository
     */
    findActiveFacilities():
        Promise<HealthFacility[]>;

    /**
     * Updates the health facility in the repository.
     * @param facility
     */
    /**
     update(
     facility: HealthFacility
     ): Promise<void>
     **/

}