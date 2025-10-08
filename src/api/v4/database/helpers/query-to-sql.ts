/**
 * Utilities for building parameterized SQL statements from high-level query options.
 *
 * Notes:
 * - Identifiers are quoted to avoid collisions with reserved words.
 * - Only known columns (from the database schema) are allowed in filters and ordering.
 * - Values are always bound as parameters to prevent SQL injection.
 */

import {QueryOptions} from "../types/repository";
import {getColumns} from "./column";
import {getDatabase} from "../index";

/**
 * Quote a SQL identifier using backticks and escape existing backticks.
 * This treats names like `aired.from` as a single identifier when passed as-is.
 *
 * @param name Identifier (table or column) to quote.
 * @returns Quoted identifier, safe to interpolate into SQL.
 */
const quoteIdent = (name: string) => "`" + name.replace(/`/g, "``") + "`";

/**
 * Check whether a value is a non-negative integer.
 *
 * @param n Value to check.
 * @returns `true` if `n` is an integer and `>= 0`, otherwise `false`.
 */
const isPositiveInt = (n: unknown) => Number.isInteger(n) && (n as number) >= 0;

/**
 * Build a SELECT query and parameters from the provided `QueryOptions`.
 *
 * Behavior:
 * - SELECTs all columns from the given table.
 * - Adds `WHERE` filters for `query.filters` keys that are known columns.
 * - Adds a `LIKE` search across text columns whose names include "title".
 * - Adds `ORDER BY` if `orderBy` is a known column; direction defaults to ASC.
 * - Adds `LIMIT` and `OFFSET` (OFFSET only when LIMIT is present).
 *
 * All dynamic values are parameterized; only identifiers are interpolated after validation/quoting.
 *
 * @param query Query options:
 *   - `filters`: Record of column\->value equals comparisons.
 *   - `search`: Full-text LIKE search string (applied to title-like text columns).
 *   - `orderBy`: Column name to sort by (must exist in the table).
 *   - `orderDirection`: "ASC" or "DESC" (defaults to "ASC").
 *   - `limit`: Max rows to return (non-negative integer).
 *   - `page`: 1-based page index used to compute OFFSET when `limit` is set.
 * @param tableName Target table name.
 * @returns Promise resolving to `{ sql, params }` ready for prepared execution.
 */
export async function QueryToSQL(query: QueryOptions, tableName: string): Promise<{ sql: string, params: any[] }> {
    const db = getDatabase();
    const cols = getColumns(tableName, db);
    const colNames = new Set(cols.map(c => c.name));

    let sql = `SELECT *
               FROM ${quoteIdent(tableName)}`;
    const params: any[] = [];
    const filters: string[] = [];

    // Apply equality filters only for known columns
    if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
            if (value !== undefined && colNames.has(key)) {
                filters.push(`${quoteIdent(key)} = ?`);
                params.push(value);
            }
        });
    }

    if (filters.length) sql += ` WHERE ${filters.join(" AND ")}`;

    // Apply LIKE search across "title"-like text columns
    if (query.search) {
        const textCols = cols.filter(col =>
            ["TEXT", "VARCHAR", "CHAR", "CLOB"].includes(col.type.toUpperCase()) &&
            col.name.includes("title")
        ).map(col => col.name);

        if (textCols.length) {
            const searchConditions = textCols.map(col => `${quoteIdent(col)} LIKE ?`).join(" OR ");
            sql += filters.length ? " AND" : " WHERE";
            sql += ` (${searchConditions})`;
            params.push(...textCols.map(() => `%${query.search}%`));
        }
    }

    // Safe ORDER BY for known columns only
    if (query.orderBy && colNames.has(query.orderBy)) {
        const dir = query.orderDirection?.toUpperCase() === "DESC" ? "DESC" : "ASC";
        sql += ` ORDER BY ${quoteIdent(query.orderBy)} ${dir}`;
    }

    // LIMIT and OFFSET (OFFSET only when LIMIT is provided)
    if (isPositiveInt(query.limit)) {
        sql += ` LIMIT ?`;
        params.push(query.limit);
        if (isPositiveInt(query.page)) {
            sql += ` OFFSET ?`;
            params.push((query.page!! - 1) * query.limit!!);
        }
    }

    return {sql, params};
}

/**
 * Build a SELECT COUNT(\*) query mirroring the same filters and search rules as `QueryToSQL`.
 *
 * Behavior:
 * - SELECTs `COUNT(*) AS count` from the given table.
 * - Applies the same validated equality filters as `QueryToSQL`.
 * - Applies the same title-like `LIKE` search conditions when `query.search` is present.
 *
 * @param query Query options (uses `filters` and `search`).
 * @param tableName Target table name.
 * @returns Promise resolving to `{ sql, params }` for counting matching rows.
 */
export async function CountQueryToSQL(query: QueryOptions, tableName: string): Promise<{ sql: string, params: any[] }> {
    const db = getDatabase();
    const cols = getColumns(tableName, db);
    const colNames = new Set(cols.map(c => c.name));

    let sql = `SELECT COUNT(*) as count
               FROM ${quoteIdent(tableName)}`;
    const params: any[] = [];
    const filters: string[] = [];

    // Apply equality filters only for known columns
    if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
            if (value !== undefined && colNames.has(key)) {
                filters.push(`${quoteIdent(key)} = ?`);
                params.push(value);
            }
        });
    }

    if (filters.length) sql += ` WHERE ${filters.join(" AND ")}`;

    if (query.search) {
        const textCols = cols.filter(col =>
            ["TEXT", "VARCHAR", "CHAR", "CLOB"].includes(col.type.toUpperCase()) &&
            col.name.includes("title")
        ).map(col => col.name);

        if (textCols.length) {
            const searchConditions = textCols.map(col => `${quoteIdent(col)} LIKE ?`).join(" OR ");
            sql += filters.length ? " AND" : " WHERE";
            sql += ` (${searchConditions})`;
            params.push(...textCols.map(() => `%${query.search}%`));
        }
    }

    return {sql, params};
}