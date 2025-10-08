import {Database} from "bun:sqlite";

/**
 * Checks if a specified column exists in a given table within the database.
 *
 * This function queries the database schema to determine if a column with the
 * specified name exists in the given table. It uses the `PRAGMA table_info`
 * SQLite command to retrieve the table's column information.
 *
 * @param {string} tableName - The name of the table to check in the database.
 * @param {string} columnName - The name of the column to check for existence.
 * @param {Database} db - The database instance to query.
 * @return {boolean} - Returns true if the column exists in the specified table, otherwise false.
 */
export function columnExists(tableName: string, columnName: string, db: Database): boolean {
    const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
    const columns = stmt.all();
    return columns.some((col: any) => col.name === columnName);
}

/**
 * Adds a new column to a specified table in the database, if the column does not already exist.
 *
 * This function first checks if the column already exists in the table. If the column
 * does not exist, it executes an `ALTER TABLE` statement to add the new column with
 * the specified definition.
 *
 * @param {string} tableName - The name of the table to which the column will be added.
 * @param {string} columnDef - The definition of the new column, including its name and type.
 * @param {Database} db - The database instance where the operation will be performed.
 * @return {void} This method does not return a value.
 */
export function addColumn(tableName: string, columnDef: string, db: Database): void {
    const columnName = columnDef.split(" ")[0].trim();
    if (columnExists(tableName, columnName, db)) {
        return;
    }

    const sql = `ALTER TABLE ${tableName}
        ADD COLUMN ${columnDef}`;
    db.run(sql);
}

/**
 * Retrieves information about a specific column in a table.
 *
 * This function queries the database schema to find and return metadata about
 * a column in the specified table. If the column does not exist, it returns null.
 *
 * @param {string} tableName - The name of the table to query.
 * @param {string} columnName - The name of the column to retrieve information about.
 * @param {Database} db - The database instance to query.
 * @return {any | null} - Returns the column metadata if the column exists, otherwise null.
 */
export function getColumn(tableName: string, columnName: string, db: Database): any | null {
    const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
    const columns = stmt.all();
    const column = columns.find((col: any) => col.name === columnName);
    return column || null;
}

export function getColumns(tableName: string, db: Database): Record<string, any>[] {
    const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
    return stmt.all() as Record<string, any>[];
}

/**
 * Drops a column from a specified table in the database.
 *
 * This function first checks if the column exists in the table. If the column
 * does not exist, it throws an error. Otherwise, it executes an `ALTER TABLE`
 * statement to drop the column.
 *
 * @param {string} tableName - The name of the table from which the column will be dropped.
 * @param {string} columnName - The name of the column to be dropped.
 * @param {Database} db - The database instance where the operation will be performed.
 * @return {void} This method does not return a value.
 * @throws {Error} If the specified column does not exist in the table.
 */
export function dropColumn(tableName: string, columnName: string, db: Database): void {
    if (!getColumn(tableName, columnName, db)) {
        throw new Error(`Column ${columnName} does not exist in table ${tableName}`);
    }

    db.run(`ALTER TABLE ${tableName}
        DROP COLUMN ${columnName}`);
}

/**
 * Renames a column in a specified database table.
 *
 * This function first checks if the column exists in the table. If the column
 * does not exist, it throws an error. Otherwise, it executes an `ALTER TABLE`
 * statement to rename the column.
 *
 * @param {string} tableName - The name of the table containing the column to be renamed.
 * @param {string} oldColumnName - The current name of the column to be renamed.
 * @param {string} newColumnName - The new name for the column.
 * @param {Database} db - The database instance where the table resides.
 * @return {any} The updated column information after renaming.
 * @throws {Error} If the specified column does not exist in the table.
 */
export function renameColumn(tableName: string, oldColumnName: string, newColumnName: string, db: Database): any {
    if (!getColumn(tableName, oldColumnName, db)) {
        throw new Error(`Column ${oldColumnName} does not exist in table ${tableName}`);
    }

    db.run(`ALTER TABLE ${tableName}
        RENAME COLUMN ${oldColumnName} TO ${newColumnName}`);
    return getColumn(tableName, newColumnName, db);
}