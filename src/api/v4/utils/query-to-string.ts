import {QueryOptions} from "../database/types/repository";

/**
 * Serializes QueryOptions into a URL query string fragment.
 * Only defined values are included, and filter values are URL-encoded.
 *
 * Iterates top-level options and filter entries, appending encoded key/value pairs to a string prefixed with '&'.
 *
 * @param {QueryOptions} query - The query options to serialize.
 * @returns {string} A query string starting with "&" for each parameter.
 */
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