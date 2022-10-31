import {
	handleTransactionsCall,
	handleTransactionsForAddressCall,
	handleBalancesCall,
	handleEventLogsCall,
	handleEventLogsForAddressCall
} from "../src/api/handlers.js";
import {
	getCacheKeyTransactions,
	getCacheKeyTransactionsForAddress,
	getCacheKeyBalances,
	getCacheKeyEventLogs,
	getCacheKeyEventLogsForAddress
} from "../src/utils/helpers.ts";
import { appCache } from "../src/utils/cache.js";
import httpMocks from "node-mocks-http";
import { dbConnection } from "../src/database/connection";

/**
 * Some tests use specific addresses that they expect to exist in the database.
 * This should be improved to instead insert and delete any prerequisite data.
 */

describe("api handler tests", () => {

	afterAll(done => {
		// Manually close db connection so tests don't hang
		dbConnection.end();
		done();
	});

	/*
	 * Event logs tests
	 */

	test("getting transactions returns cached response", async () => {
		const req  = httpMocks.createRequest(
			{
				query: {
					limit: "1"
				}
			}
		);
		const res = httpMocks.createResponse();
		const results = {value: "test"};
		const cacheKey = getCacheKeyTransactions(req);
		appCache.set(cacheKey, results, 5);

		await handleTransactionsCall(req, res);
		const data = res._getJSONData();

		expect(data.results).toEqual(results);

		appCache.del(cacheKey);
	});

	test("getting transactions returns proper object", async () => {
		const req  = httpMocks.createRequest(
			{
				query: {
					limit: "1"
				}
			}
		);
		const res = httpMocks.createResponse();

		await handleTransactionsCall(req, res);
		const data = res._getJSONData();

		expect("status" in data).toBe(true);
		expect("message" in data).toBe(true);
		expect("results" in data).toBe(true);
		expect(typeof data.results).toBe("object");
	});

	test("getting transactions for address returns cached response", async () => {
		const req  = httpMocks.createRequest({
			params: {
				fromOrTo: "to",
				address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
			}
		});
		const res = httpMocks.createResponse();
		const results = {value: "test"};
		const cacheKey = getCacheKeyTransactionsForAddress(req);
		appCache.set(cacheKey, results, 5);

		await handleTransactionsForAddressCall(req, res);
		const data = res._getJSONData();

		expect(data.results).toEqual(results);

		appCache.del(cacheKey);
	});

	test("getting transactions for address returns proper object", async () => {
		const req  = httpMocks.createRequest(
			{
				query: {
					limit: "1"
				},
				params: {
					fromOrTo: "to",
					address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
				}
			}
		);
		const res = httpMocks.createResponse();

		await handleTransactionsForAddressCall(req, res);
		const data = res._getJSONData();

		expect("status" in data).toBe(true);
		expect("message" in data).toBe(true);
		expect("results" in data).toBe(true);
		expect(typeof data.results).toBe("object");
	});

	/*
	 * Balances tests
	 */

	test("getting balance returns cached response", async () => {
		const req  = httpMocks.createRequest(
			{
				params: {
					address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
				}
			}
		);
		const res = httpMocks.createResponse();
		const results = {value: "test"};
		const cacheKey = getCacheKeyBalances(req);
		appCache.set(cacheKey, results, 5);

		await handleBalancesCall(req, res);
		const data = res._getJSONData();

		expect(data.results).toEqual(results);

		appCache.del(cacheKey);
	});

	test("getting balance returns proper object", async () => {
		const req  = httpMocks.createRequest(
			{
				params: {
					address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
				}
			}
		);
		const res = httpMocks.createResponse();

		await handleBalancesCall(req, res);
		const data = res._getJSONData();

		expect("status" in data).toBe(true);
		expect("message" in data).toBe(true);
		expect("results" in data).toBe(true);
		expect(typeof data.results).toBe("object");
	});

	/*
	 * Event logs tests
	 */

	test("getting event logs returns cached response", async () => {
		const req  = httpMocks.createRequest(
			{
				query: {
					limit: "1"
				}
			}
		);
		const res = httpMocks.createResponse();
		const results = {value: "test"};
		const cacheKey = getCacheKeyEventLogs(req);
		appCache.set(cacheKey, results, 5);

		await handleEventLogsCall(req, res);
		const data = res._getJSONData();

		expect(data.results).toEqual(results);

		appCache.del(cacheKey);
	});

	test("getting event logs returns properly shaped object", async () => {
		const req  = httpMocks.createRequest(
			{
				query: {
					limit: "1"
				}
			}
		);
		const res = httpMocks.createResponse();

		await handleEventLogsCall(req, res);
		const data = res._getJSONData();

		expect("status" in data).toBe(true);
		expect("message" in data).toBe(true);
		expect("results" in data).toBe(true);
		expect("eventLogs" in data.results).toBe(true);
		expect("count" in data.results).toBe(true);
		expect("lastId" in data.results).toBe(true);
		expect(typeof data.results.eventLogs).toBe("object");
	});

	test("getting event logs for address returns cached response", async () => {
		const req  = httpMocks.createRequest({
			params: {
				fromOrTo: "to",
				address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
			}
		});
		const res = httpMocks.createResponse();
		const results = {value: "test"};
		const cacheKey = getCacheKeyEventLogsForAddress(req);
		appCache.set(cacheKey, results, 5);

		await handleEventLogsForAddressCall(req, res);
		const data = res._getJSONData();

		expect(data.results).toEqual(results);

		appCache.del(cacheKey);
	});

	test("getting event logs for address returns properly shaped object", async () => {
		const req  = httpMocks.createRequest(
			{
				query: {
					limit: "1"
				},
				params: {
					fromOrTo: "to",
					address: "0xE592427A0AEce92De3Edee1F18E0157C05861564"
				}
			}
		);
		const res = httpMocks.createResponse();

		await handleEventLogsForAddressCall(req, res);
		const data = res._getJSONData();

		expect("status" in data).toBe(true);
		expect("message" in data).toBe(true);
		expect("results" in data).toBe(true);
		expect("eventLogs" in data.results).toBe(true);
		expect("count" in data.results).toBe(true);
		expect("lastId" in data.results).toBe(true);
		expect(typeof data.results.eventLogs).toBe("object");
	});
});