import { dbConnection } from "./connection";
import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2/promise";

/**
 * Get a row by id
 * @param {string} table The table to get the row from
 * @param {number} id The unique id of the transaction to get
 * @returns The result object
 */
async function getRowById(table: string, id: number): Promise<RowDataPacket | RowDataPacket[] | OkPacket | boolean> {
	const query: string  = `SELECT *
		FROM ??
		WHERE id = ?
		LIMIT 1
	`;

	const queryValues: [string, number] = [
		table,
		id,
	];

	let results: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
	[results] = await dbConnection.query(query, queryValues);

	if (!Array.isArray(results) || results.length < 1) {
		return false;
	}

	return results[0];
}

/**
 * Delete a row by id
 *
 * @param {string} table The table to delete the row from
 * @param {number} id The row id to delete
 * @returns The query result
 */
 async function deleteRowById(table: string, id: number): Promise<RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader> {
	const query: string = `DELETE
		FROM ??
		WHERE id = ?
		LIMIT 1
	`;

	const queryValues: [string, number] = [
		table,
		id,
	];

	let results: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
	[results] = await dbConnection.query(query, queryValues);

	return results;
}

export {
	getRowById,
	deleteRowById
};