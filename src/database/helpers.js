import { dbConnection } from "../database/connection.js";

/**
 * Get a row by id
 * @param {string} table The table to get the row from
 * @param {number} id The unique id of the transaction to get
 * @returns The result object
 */
async function getRowById(table, id) {
	const query = `SELECT *
		FROM ??
		WHERE id = ?
		LIMIT 1
	`;

	const queryValues = [
		table,
		id,
	];

	let [results] = await dbConnection.query(query, queryValues);

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
 async function deleteRowById(table, id) {
	const query = `DELETE
		FROM ??
		WHERE id = ?
		LIMIT 1
	`;

	const queryValues = [
		table,
		id,
	];

	let [results] = await dbConnection.query(query, queryValues);

	return results;
}

export { getRowById, deleteRowById };