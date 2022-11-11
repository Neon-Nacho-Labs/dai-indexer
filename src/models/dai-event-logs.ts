import { dbConnection, MYSQL_TABLE_DAI_EVENT_LOGS } from "../database/connection";
import { bytes32ToAddressString, bytes32ToIntString, moveDecimalAndFormat } from "../utils/helpers";
import { getRowById, deleteRowById } from "../database/helpers";
import debug from "debug";
import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2/promise";
import { IEventLogsReturn, IQueryResultDaiEventLogs, IEthereumEventLog, FormattedEventLog } from "../common/types";

const d: debug.Debugger = debug("model-dai-event-logs");

/**
 * Get a list of Dai event logs
 * Currenty we're only indexing and returning "Transfer" events
 *
 * @param {number} limit The SQL query limit
 * @param {number} lastId The id returned from the previous page (for pagination)
 * @returns An array of Dai event logs or null
 */
async function getDaiEventLogs(limit: number = 100, lastId: number = 0): Promise<IEventLogsReturn | null> {
	// Only allow a max of 100 records at a time
	limit = Math.min(limit, 100);

	// Use a "seek" approach to pagination to avoid the performance issues with using offset
	let query: string = `SELECT id, from_address, to_address, raw_value, value, transaction_hash, event_name
		FROM ??`;

	// Condition for pages after the first
	if (lastId > 0) {
		query += " WHERE id < ?";
	}

	query += " ORDER BY id DESC LIMIT ?";

	const queryValues: [string, number?, number?] = [MYSQL_TABLE_DAI_EVENT_LOGS];
	if (lastId > 0) {
		queryValues.push(lastId);
	}
	queryValues.push(limit);

	let results: IQueryResultDaiEventLogs[] | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
	[results] = await dbConnection.query(query, queryValues);

	if (! isDaiEventLogsOrEmpty(results)) {
		return null;
	}

	const newLastId: number = results.length > 0
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
async function getDaiEventLogById(id: number) {
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
async function getDaiEventLogsForAddress(fromOrTo: string, address: string, limit: number = 100, lastId: number = 0): Promise<IEventLogsReturn | null> {
	if (!["to", "from"].includes(fromOrTo)) {
		return null;
	}

	// Only allow a max of 100 records at a time
	limit = Math.min(limit, 100);

	// Use a "seek" approach to pagination to avoid the performance issues with using offset
	let query: string = `SELECT id, from_address, to_address, raw_value, value, transaction_hash, event_name
		FROM ??
		WHERE ?? = ?`;

	// Condition for pages after the first
	if (lastId > 0) {
		query += " AND id < ?";
	}

	query += " ORDER BY id DESC LIMIT ?";

	const queryValues: [string, string, string, number?, number?] = [
		MYSQL_TABLE_DAI_EVENT_LOGS,
		`${fromOrTo}_address`,
		address
	];
	if (lastId > 0) {
		queryValues.push(lastId);
	}
	queryValues.push(limit);

	let results: IQueryResultDaiEventLogs[] | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
	[results] = await dbConnection.query(query, queryValues);

	if (! isDaiEventLogsOrEmpty(results)) {
		return null;
	}

	const newLastId: number = results.length > 0
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
 * @param {IEthereumEventLog} log An event log object
 * @returns True is successful, false on failure
 */
 async function saveDaiEventLog(log: IEthereumEventLog): Promise<ResultSetHeader | null> {
	const query: string = `
		INSERT INTO ${MYSQL_TABLE_DAI_EVENT_LOGS}
		(from_address, to_address, raw_value, value, transaction_hash, event_signature, event_name)
		values ?`;

	const queryValues: FormattedEventLog = formatEventLog(log);
	if (!queryValues) {
		return null;
	}
	let results: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;
	[results] = await dbConnection.query(query, [[queryValues]]);

	d(results);

	if (! isResultSetHeader(results)) {
		return null;
	}

	return results;;
}

/**
 * Delete an event log by id
 *
 * @param {number} id The event log id to delete
 * @returns The query result
 */
 async function deleteDaiEventLogById(id: number): Promise<RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader> {
	return deleteRowById(MYSQL_TABLE_DAI_EVENT_LOGS, id);
}

/**
 * Take event log object and format it for SQL values
 *
 * @param {object} log An event log as returned from an Ethereum node
 * @returns An array formatted for an SQL query or false on failure
 */
function formatEventLog(log: IEthereumEventLog): FormattedEventLog | null {
	if (
		!Array.isArray(log.topics)
		|| log.topics.length !== 3
		|| !log.data
		|| !log.transactionHash
	) {
		return null;
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

/**
 * Type guard to check for the IQueryResultDaiEventLogs[] type
 *
 * @param {mixed} result The result to check
 * @returns True if result is the expected type, false otherwise
 */
function isDaiEventLogsOrEmpty(
	result: IQueryResultDaiEventLogs[] | RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader
): result is IQueryResultDaiEventLogs[] {
	let resultCasted: IQueryResultDaiEventLogs[] = result as IQueryResultDaiEventLogs[];
	if(resultCasted.length === 0 || resultCasted[0].id !== undefined) {
		return true;
	}

	return false;
}

/**
 * Type guard to check for the ResultSetHeader
 *
 * @param {mixed} result The result to check
 * @returns True if result is the expected type, false otherwise
 */
 function isResultSetHeader(
	result: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader
): result is ResultSetHeader {
	let resultCasted: ResultSetHeader = result as ResultSetHeader;

	if("affectedRows" in resultCasted) {
		return true;
	}

	return false;
}

export {
	getDaiEventLogs,
	getDaiEventLogsForAddress,
	getDaiEventLogById,
	saveDaiEventLog,
	deleteDaiEventLogById
};