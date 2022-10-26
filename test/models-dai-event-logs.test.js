import {
	getDaiEventLogs,
	getDaiEventLogsForAddress,
	getDaiEventLogById,
	saveDaiEventLog,
	deleteDaiEventLogById
} from "../src/models/dai-event-logs.js";
import { dbConnection } from "../src/database/connection.js";

/**
 * Some tests use specific addresses that they expect to exist in the database.
 * This should be improved to instead insert and delete any prerequisite data.
 */

describe("transactions tests", () => {

	afterAll(done => {
		// Manually close db connection so tests don't hang
		dbConnection.end();
		done();
	});

	test("getting event logs returns properly shaped object", async () => {
		const results = await getDaiEventLogs(1);

		expect("eventLogs" in results).toBe(true);
		expect("count" in results).toBe(true);
		expect("lastId" in results).toBe(true);
		expect(results.eventLogs.length).toBe(1);
		expect("id" in results.eventLogs[0]).toBe(true);
		expect("from_address" in results.eventLogs[0]).toBe(true);
		expect("to_address" in results.eventLogs[0]).toBe(true);
		expect("raw_value" in results.eventLogs[0]).toBe(true);
		expect("value" in results.eventLogs[0]).toBe(true);
		expect("transaction_hash" in results.eventLogs[0]).toBe(true);
		expect("event_name" in results.eventLogs[0]).toBe(true);
	});

	test("getting event logs returns multiple results", async () => {
		const results = await getDaiEventLogs(2);

		expect(results.eventLogs.length).toBe(2);
	});

	test("getting event logs by id returns correct transaction", async () => {
		const results = await getDaiEventLogs(1);
		const row_id = results.eventLogs[0].id;
		const result = await getDaiEventLogById(row_id);

		expect(result.id).toBe(row_id);
	});

	test("getting event logs with invalid id returns false", async () => {
		const result = await getDaiEventLogById(0);

		expect(result).toBe(false);
	});

	test("getting event logs for address returns properly shaped object", async () => {
		const results = await getDaiEventLogsForAddress("to", "0xE592427A0AEce92De3Edee1F18E0157C05861564", 1);

		expect("eventLogs" in results).toBe(true);
		expect("count" in results).toBe(true);
		expect("lastId" in results).toBe(true);
		expect(results.eventLogs.length).toBe(1);
		expect("id" in results.eventLogs[0]).toBe(true);
		expect("from_address" in results.eventLogs[0]).toBe(true);
		expect("to_address" in results.eventLogs[0]).toBe(true);
		expect("raw_value" in results.eventLogs[0]).toBe(true);
		expect("value" in results.eventLogs[0]).toBe(true);
		expect("transaction_hash" in results.eventLogs[0]).toBe(true);
		expect("event_name" in results.eventLogs[0]).toBe(true);
	});

	test("getting event logs for address returns multiple results", async () => {
		const results = await getDaiEventLogsForAddress("to", "0xE592427A0AEce92De3Edee1F18E0157C05861564", 2);

		expect(results.eventLogs.length).toBe(2);
	});

	test("getting event logs for address returns result with correct address", async () => {
		const results = await getDaiEventLogsForAddress("to", "0xE592427A0AEce92De3Edee1F18E0157C05861564", 1);

		expect("to_address" in results.eventLogs[0]).toBe(true);
		expect(results.eventLogs[0].to_address).toBe("0xE592427A0AEce92De3Edee1F18E0157C05861564");
	});

	test("getting event logs for address with invalid fromOrTo returns false", async () => {
		const results = await getDaiEventLogsForAddress("invalid", "0xE592427A0AEce92De3Edee1F18E0157C05861564", 1);

		expect(results).toBe(false);
	});

	test("saving event logs saves row", async () => {
		const log = {
			data: "0x0000000000000000000000000000000000000000000000ff7c15c10c5d602400",
			topics: [
				"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
				"0x00000000000000000000000074de5d4fcbf63e00296fd95d33236b9794016631",
				"0x000000000000000000000000c0a819890303ae6f4ff5d4103ee76f9756661765"
			],
			transactionHash: "0x09c84b05c057af5e006077e022aa7b7e91deff7b93f17e076de4cc95ad439536",
		};
		const result = await saveDaiEventLog(log);

		expect(result.affectedRows).toBe(1);

		if (result.insertId > 0) {
			await deleteDaiEventLogById(result.insertId);
		}
	});

	test("deleting event logs deletes row", async () => {
		const log = {
			data: "0x0000000000000000000000000000000000000000000000ff7c15c10c5d602400",
			topics: [
				"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
				"0x00000000000000000000000074de5d4fcbf63e00296fd95d33236b9794016631",
				"0x000000000000000000000000c0a819890303ae6f4ff5d4103ee76f9756661765"
			],
			transactionHash: "0x09c84b05c057af5e006077e022aa7b7e91deff7b93f17e076de4cc95ad439536",
		};
		const result = await saveDaiEventLog(log);
		expect(result.insertId).toBeGreaterThan(0);

		const deleteResult = await deleteDaiEventLogById(result.insertId);
		expect(deleteResult.affectedRows).toBe(1);
	});
});