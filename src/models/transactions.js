import { dbConnection, MYSQL_TABLE_TRANSACTIONS } from "../database/connection";
import { getRowById, deleteRowById } from "../database/helpers";

/**
 * Get a list of the most recent transactions
 *
 * @param {number|undefined} limit The SQL query limit
 * @param {number|undefined} offset The SQL query offset
 * @returns Array of results
 */
async function getTransactions(limit = 100, offset = 0) {
	// Only allow a max of 100 records at a time
	limit = Math.min(limit, 100);

	/*
	 * NOTE: Using OFFSET for pagination is generally not great scaling – the higher the number, the longer the query will take.
	 * These queries need to be better optimized, probably by using a seek method by using the unique row id to track the last returned record.
	 */
	const query = `SELECT *
		FROM ??
		ORDER BY id DESC
		LIMIT ?
		OFFSET ?
	`;

	const queryValues = [
		MYSQL_TABLE_TRANSACTIONS,
		limit,
		offset
	];

	let [results] = await dbConnection.query(query, queryValues);

	return results;
}

/**
 * Get a transaction by id
 *
 * @param {number} id The unique id of the transaction to get
 * @returns The result object
 */
async function getTransactionById(id) {
	return getRowById(MYSQL_TABLE_TRANSACTIONS, id);
}

/**
 * Get a list of the most recent transactions for a specific "to" or "from" address
 *
 * @param {string} fromOrTo "from" or "to"
 * @param {string} address An Ethereum address
 * @param {number|undefined} limit The SQL query limit
 * @param {number|undefined} offset The SQL query offset
 * @returns Array of results
 */
async function getTransactionsForAddress(fromOrTo, address, limit = 100, offset = 0) {
	if (!["to", "from"].includes(fromOrTo)) {
		return false;
	}

	// Only allow a max of 100 records at a time
	limit = Math.min(limit, 100);

	/*
	 * NOTE: See note in getTransactions() function regarding OFFSET
	 */
	const query = `SELECT *
		FROM ??
		WHERE ?? = ?
		ORDER BY id DESC
		LIMIT ?
		OFFSET ?
	`;

	const queryValues = [
		MYSQL_TABLE_TRANSACTIONS,
		`${fromOrTo}_address`,
		address,
		limit,
		offset
	];

	let [results] = await dbConnection.query(query, queryValues);

	return results;
}

/**
 * Save transactions in DB
 *
 * @param {Array} transactions An array of Ethereum transactions
 * @returns The query result
 */
 async function saveTransactions(transactions) {
	const query = `
		INSERT INTO ${MYSQL_TABLE_TRANSACTIONS}
		(hash, from_address, to_address, value, block_number)
		values ?
		ON DUPLICATE KEY UPDATE
		hash=VALUES(hash)`;

	// Build an array of values for each row
	const queryValues = transactions.map(transaction => {
		return [
			transaction.hash,
			transaction.from,
			transaction.to,
			transaction.value.toString(),
			transaction.blockNumber
		];
	});

	const [results] = await dbConnection.query(query, [queryValues]);

	return results;
}

/**
 * Delete a transaction by id
 *
 * @param {number} id The transaction id to delete
 * @returns The query result
 */
async function deleteTransactionById(id) {
	return deleteRowById(MYSQL_TABLE_TRANSACTIONS, id);
}

export { getTransactions, getTransactionById, getTransactionsForAddress, saveTransactions, deleteTransactionById };