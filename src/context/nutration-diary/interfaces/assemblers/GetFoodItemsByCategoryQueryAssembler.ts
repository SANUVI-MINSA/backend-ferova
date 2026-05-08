import {GetFoodItemsByCategoryQuery} from "../../model/domain/queries/GetFoodItemsByCategoryQuery";

export class GetFoodItemsByCategoryQueryAssembler {

    static toQuery(
        category: string
    ): GetFoodItemsByCategoryQuery {

        return {
            category
        };
    }
}