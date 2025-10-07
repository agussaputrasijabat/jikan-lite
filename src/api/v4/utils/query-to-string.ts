import {QueryOptions} from "../database/types/repository";

export function QueryToString(query: QueryOptions): string {
    let queryString = '';

    if (query.page) queryString += `&page=${query.page}`;
    if (query.limit) queryString += `&limit=${query.limit}`;
    if (query.orderBy) queryString += `&order_by=${query.orderBy}`;
    if (query.orderDirection) queryString += `&order_direction=${query.orderDirection}`;

    if (query.filters) {
        for (const [key, value] of Object.entries(query.filters)) {
            if (value !== undefined && value !== null) {
                queryString += `&${key}=${encodeURIComponent(value)}`;
            }
        }
    }


    return queryString;
}