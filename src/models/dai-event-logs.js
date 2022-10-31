import { dbConnection, MYSQL_TABLE_DAI_EVENT_LOGS } from "../database/connection.js";
import { bytes32ToAddressString, bytes32ToIntString, moveDecimalAndFormat } from "../utils/helpers";
import { getRowById, deleteRowById } from "../database/helpers.js";
import debug from "debug";

const d = debug("model-dai-event-logs");

/**
 * Get a list of Dai event logs
 * Currenty we're only indexing and returning "Transfer" events
 *
 * @param {number} limit The SQL query limit
 * @param {number} lastId The id returned from the previous page (for pagination)
 * @returns An array of Dai event logs
 */
async function getDaiEventLogs(limit = 100, lastId = 0) {
	// Only allow a max of 100 records at a time
	limit = Math.min(limit, 100);

	// Use a "seek" approach to pagination to avoid the performance issues with using offset
	let query = `SELECT id, from_address, to_address, raw_value, value, transaction_hash, event_name
		FROM ??`;

	// Condition for pages after the first
	if (lastId > 0) {
		query += " WHERE id < ?";
	}

	query += " ORDER BY id DESC LIMIT ?";

	const queryValues = [MYSQL_TABLE_DAI_EVENT_LOGS];
	if (lastId > 0) {
		queryValues.push(lastId);
	}
	queryValues.push(limit);

	let [results] = await dbConnection.query(query, queryValues);

	const newLastId = results.length > 0
		? results[results.length - 1].id
		: 0;

	return {
		"eventLogs": results,
		"count": results.length,
		"lastId": newLastId
	};
}

/**
 * Get a dai event log by id
 *
 * @param {number} id The unique id of the event log to get
 * @returns The result object
 */
async function getDaiEventLogById(id) {
	return getRowById(MYSQL_TABLE_DAI_EVENT_LOGS, id);
}

/**
 * Get a list of Dai event logs by from or to address
 *
 * @param {string} fromOrTo "from" or "to"
 * @param {string} address An Ethereum address
 * @param {number} limit The SQL query limit
 * @param {number} lastId The id returned from the previous page (for pagination)
 * @returns An array of Dai event logs by address
 */
async function getDaiEventLogsForAddress(fromOrTo, address, limit = 100, lastId = 0) {
	if (!["to", "from"].includes(fromOrTo)) {
		return false;
	}

	// Only allow a max of 100 records at a time
	limit = Math.min(limit, 100);

	// Use a "seek" approach to pagination to avoid the performance issues with using offset
	let query = `SELECT id, from_address, to_address, raw_value, value, transaction_hash, event_name
		FROM ??
		WHERE ?? = ?`;

	// Condition for pages after the first
	if (lastId > 0) {
		query += " AND id < ?";
	}

	query += " ORDER BY id DESC LIMIT ?";

	const queryValues = [
		MYSQL_TABLE_DAI_EVENT_LOGS,
		`${fromOrTo}_address`,
		address
	];
	if (lastId > 0) {
		queryValues.push(lastId);
	}
	queryValues.push(limit);

	let [results] = await dbConnection.query(query, queryValues);

	const newLastId = results.length > 0
		? results[results.length - 1].id
		: 0;

	return {
		"eventLogs": results,
		"count": results.length,
		"lastId": newLastId
	};
}

/**
 * Save Dai event log
 *
 * @param {Array} log An event log object
 * @returns The query results
 */
 async function saveDaiEventLog(log) {
	const query = `
		INSERT INTO ${MYSQL_TABLE_DAI_EVENT_LOGS}
		(from_address, to_address, raw_value, value, transaction_hash, event_signature, event_name)
		values ?`;

	const queryValues = formatEventLog(log);
	if (!queryValues) {
		return false;
	}

	const [results] = await dbConnection.query(query, [[queryValues]]);

	d(results);

	return results;
}

/**
 * Delete an event log by id
 *
 * @param {number} id The event log id to delete
 * @returns The query result
 */
 async function deleteDaiEventLogById(id) {
	return deleteRowById(MYSQL_TABLE_DAI_EVENT_LOGS, id);
}

/**
 * Take event log object and format it for SQL values
 *
 * @param {object} log An event log as returned from an Ethereum node
 * @returns An array formatted for an SQL query or false on failure
 */
function formatEventLog(log) {
	if (
		!Array.isArray(log.topics)
		|| log.topics.length !== 3
		|| !log.data
		|| !log.transactionHash
	) {
		return false;
	}

	const intValue = bytes32ToIntString(log.data);

	return [
		bytes32ToAddressString(log.topics[1]),
		bytes32ToAddressString(log.topics[2]),
		intValue,
		moveDecimalAndFormat(intValue),
		log.transactionHash,
		log.topics[0],
		"Transfer" // hard code for now – we're only storing transfer events
	];
}

export {
	getDaiEventLogs,
	getDaiEventLogsForAddress,
	getDaiEventLogById,
	saveDaiEventLog,
	deleteDaiEventLogById
};