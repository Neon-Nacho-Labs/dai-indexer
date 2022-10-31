import supertest from "supertest";
import express from "express";
import { router } from "../src/api/routes.js";
import { API_BASE_PATH, RATE_LIMIT_REQUESTS_PER_TIME_PERIOD } from "../src/common/constants";
import { getCacheKeyRateLimit } from "../src/utils/helpers.ts";
import { appCache } from "../src/utils/cache.js";
import { dbConnection } from "../src/database/connection";

/**
 * Some tests use specific addresses that they expect to exist in the database.
 * This should be improved to instead insert and delete any prerequisite data.
 */

const TEST_API_KEY = "35dc55759cb5e74742b189bf2b52758993664243b2a34f2694d723948598a11d";
const app = new express();
app.use(router);

const endpoints = [
	"/transactions",
	"/transactions/to/0x6B175474E89094C44Da98b954EedeAC495271d0F?limit=1&offset=0",
	"/balances/0x6B175474E89094C44Da98b954EedeAC495271d0F",
	"/eventlogs/dai?limit=3",
	"/eventlogs/dai/from/0x00000000AE347930bD1E7B0F35588b92280f9e75?limit=2"
];

describe("api route e2e tests", () => {

	afterAll(done => {
		// Manually close db connection so tests don't hang
		dbConnection.end();
		done();
	});

	/*
	 * API key tests
	 */

	test("calling api with no api key returns 400", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/transactions");

		expect(res.statusCode).toBe(400);
	});

	test("calling api with invalid api key returns 403", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/transactions")
			.set("X-API-KEY", "bad_api_key");

		expect(res.statusCode).toBe(403);
	});

	/*
	 * General tests
	 */

	test.each(endpoints)("calling endpoint returns successful response", async (endpoint) => {
		const res = await supertest(app)
			.get(API_BASE_PATH + endpoint)
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(200);
		expect(res.header["content-type"]).toBe("application/json; charset=utf-8");
	});

	// TODO: ideally we mock the limit numbers so we don't have to make 101 requests
	test("calling endpoint too many times returns 429", async () => {
		const cacheKey = getCacheKeyRateLimit({
			headers:{
				"x-api-key":TEST_API_KEY
			}
		});
		appCache.del(cacheKey);
		let res;
		for(let i = 0; i < RATE_LIMIT_REQUESTS_PER_TIME_PERIOD; i++) {
			res = await supertest(app)
				.get(API_BASE_PATH + "/transactions?limit=1")
				.set("X-API-KEY", TEST_API_KEY);

			// Make sure the final in-limit call is successful
			if (i === RATE_LIMIT_REQUESTS_PER_TIME_PERIOD - 1) {
				expect(res.statusCode).toBe(200);
			}
		}

		res = await supertest(app)
			.get(API_BASE_PATH + "/transactions?limit=1")
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(429);
		appCache.del(cacheKey);
	});

	/*
	 * Transactions tests
	 */

	test("calling /transactions with invalid query params returns 400", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/transactions?limit=invalid")
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(400);
	});

	test("calling /transactions for address with invalid fromOrTo params returns 400", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/transactions/invalid/0x6B175474E89094C44Da98b954EedeAC495271d0F")
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(400);
	});

	/*
	 * Balances tests
	 */

	test("calling /balances with invalid address returns 400", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/balances/0x1234567")
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(400);
	});

	/*
	 * Event logs tests
	 */

	test("calling /eventlogs/dai with invalid limit query params returns 400", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/eventlogs/dai?limit=invalid")
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(400);
	});

	test("calling /eventlogs/dai with invalid lastid query params returns 400", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/eventlogs/dai?lastid=invalid")
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(400);
	});

	test("calling /eventlogs/dai for address with invalid fromOrTo params returns 400", async () => {
		const res = await supertest(app)
			.get(API_BASE_PATH + "/eventlogs/dai/invalid/0x6B175474E89094C44Da98b954EedeAC495271d0F")
			.set("X-API-KEY", TEST_API_KEY);

		expect(res.statusCode).toBe(400);
	});
});