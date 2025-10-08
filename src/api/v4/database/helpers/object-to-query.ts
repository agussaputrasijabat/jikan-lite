import {QueryOptions} from "../types/repository";

/**
 * Converts an object into a `QueryOptions` object, which is used for database queries.
 *
 * @param {any} obj - The input object containing query parameters.
 * @returns {QueryOptions} - The formatted query options object.
 *
 * The function processes the following properties from the input object:
 * - `page`: The page number (default is 1).
 * - `limit`: The number of items per page (default is 25).
 * - `orderBy`: The field to order by (default is 'mal_id').
 * - `orderDirection`: The direction of ordering, either 'ASC' or 'DESC' (default is 'ASC').
 *
 * Any other properties in the input object are added to the `filters` property of the `QueryOptions` object.
 */
export function ObjectToQuery(obj: any): QueryOptions {
    const query: QueryOptions = {
        filters: {},
        search: obj.q || undefined,
        page: Number(obj.page) || 1,
        limit: Number(obj.limit) || 25,
        orderBy: obj.orderBy || 'mal_id',
        orderDirection: ['ASC', 'DESC'].includes((obj.orderDirection || '').toUpperCase())
            ? (obj.orderDirection.toUpperCase() as 'ASC' | 'DESC')
            : 'ASC',
    };

    // Add all other properties as filters
    Object.keys(obj).forEach((key) => {
        if (!['page', 'limit', 'q', 'orderBy', 'orderDirection'].includes(key)) {
            query.filters[key] = obj[key];
        }
    });

    return query;
}

/**
 * Converts a query string into a `QueryOptions` object, which is used for database queries.
 *
 * @param {string} queryString - The input query string containing key-value pairs.
 * @returns {QueryOptions} - The formatted query options object.
 *
 * The function parses the query string into an object and then delegates to `ObjectToQuery` to format it.
 */
export function StringToQuery(queryString: string): QueryOptions {
    const params = new URLSearchParams(queryString);
    const obj: any = {};
    params.forEach((value, key) => {
        obj[key] = value;
    });
    return ObjectToQuery(obj);
}