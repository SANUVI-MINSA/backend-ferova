import {SearchFoodItemsQuery} from "../../model/domain/queries/SearchFoodItemsQuery";

export class SearchFoodItemsQueryAssembler {

    static toQuery(
        searchText: string
    ): SearchFoodItemsQuery {

        return {
            searchText
        };
    }
}