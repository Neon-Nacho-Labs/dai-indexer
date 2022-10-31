import { getTransactions, getTransactionById, getTransactionsForAddress, saveTransactions, deleteTransactionById } from "../src/models/transactions.js";
import { dbConnection } from "../src/database/connection";

/**
 * Some tests use specific addresses that they expect to exist in the database.
 * This should be improved to instead insert and delete any prerequisite data.
 */

describe("transactions tests", () => {

	afterAll(done => {
		// Manually close db connection so tests don't hang 🤙
		dbConnection.end();
		done();
	});

	test("getting transactions returns properly shaped transactions", async () => {
		const transactions = await getTransactions(1);

		expect(transactions.length).toBe(1);
		expect("id" in transactions[0]).toBe(true);
		expect("hash" in transactions[0]).toBe(true);
		expect("from_address" in transactions[0]).toBe(true);
		expect("to_address" in transactions[0]).toBe(true);
		expect("value" in transactions[0]).toBe(true);
		expect("block_number" in transactions[0]).toBe(true);
	});

	test("getting transactions returns multiple transactions", async () => {
		const transactions = await getTransactions(2);

		expect(transactions.length).toBe(2);
	});

	test("getting transaction by id returns correct transaction", async () => {
		const transactions = await getTransactions(1, 5);
		const transaction_id = transactions[0].id;
		const transaction = await getTransactionById(transaction_id);

		expect(transaction.id).toBe(transaction_id);
	});

	test("getting transaction with invalid id returns false", async () => {
		const transaction = await getTransactionById(0);

		expect(transaction).toBe(false);
	});

	test("getting transactions for address returns transactions", async () => {
		const transactions = await getTransactionsForAddress("to", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 1);

		expect(transactions.length).toBe(1);
		expect("id" in transactions[0]).toBe(true);
		expect("hash" in transactions[0]).toBe(true);
		expect("from_address" in transactions[0]).toBe(true);
		expect("to_address" in transactions[0]).toBe(true);
		expect("value" in transactions[0]).toBe(true);
		expect("block_number" in transactions[0]).toBe(true);
	});

	test("getting transactions for address returns multiple transactions", async () => {
		const transactions = await getTransactionsForAddress("to", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 2);

		expect(transactions.length).toBe(2);
	});

	test("getting transactions for address returns transactions with correct address", async () => {
		const transactions = await getTransactionsForAddress("to", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 1);

		expect("to_address" in transactions[0]).toBe(true);
		expect(transactions[0].to_address).toBe("0x6B175474E89094C44Da98b954EedeAC495271d0F");
	});

	test("getting transactions for address with invalid fromOrTo returns false", async () => {
		const transactions = await getTransactionsForAddress("invalid", "0x6B175474E89094C44Da98b954EedeAC495271d0F", 1);

		expect(transactions).toBe(false);
	});

	test("saving transactions saves transactions", async () => {
		const transactions = [
			{
				hash: "test_hash_" + (Math.random() * 1000),
				from: "test_from",
				to: "test_to",
				value: "0",
				blockNumber: 123
			}
		];
		const result = await saveTransactions(transactions);

		expect(result.affectedRows).toBe(1);

		if (result.insertId > 0) {
			await deleteTransactionById(result.insertId);
		}
	});

	test("deleting transaction deletes transaction", async () => {
		const transactions = [
			{
				hash: "test_hash_" + (Math.random() * 1000),
				from: "test_from",
				to: "test_to",
				value: "0",
				blockNumber: 123
			}
		];
		const result = await saveTransactions(transactions);
		expect(result.insertId).toBeGreaterThan(0);

		const deleteResult = await deleteTransactionById(result.insertId);
		expect(deleteResult.affectedRows).toBe(1);
	});
});