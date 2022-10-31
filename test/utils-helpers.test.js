import {
	getResponseObject,
	getApiClient,
	getHashString,
	getCacheKeyTransactions,
	getCacheKeyTransactionsForAddress,
	getCacheKeyBalances,
	bytes32ToAddressString,
	bytes32ToIntString,
	moveDecimalAndFormat,
	getDaiTransactionsByBlockNumber
} from "../src/utils/helpers.ts";
import {apiClients} from "../src/api/auth/clients";
import { Alchemy, Network } from "alchemy-sdk";
import "dotenv/config";

describe("helper tests", () => {

	test("response object is properlyy formated", () => {
		const response = getResponseObject(200, "test", {a:"b"});

		expect(response).toEqual({"status": 200, "message": "test", "results": {a:"b"}});
	});

	test("valid api client is returned", () => {
		const client = apiClients[0];
		const response = getApiClient(client.api_key);

		expect(response).toEqual(client);
	});

	test("invalid api key returns undefined", () => {
		const client = apiClients[0];
		const response = getApiClient("invalid");

		expect(response).toBeUndefined();
	});

	test("get hash returns string", () => {
		const response = getHashString("test");

		expect(typeof response).toBe("string");
	});

	test("get hash returns string", () => {
		const response = getHashString("test");

		expect(typeof response).toBe("string");
	});

	test("get transactions cache key returns string", () => {
		const response = getCacheKeyTransactions({
			query: {
				limit: 10,
				offset: 10,
			}
		});

		expect(typeof response).toBe("string");
	});

	test("get transactions from to cache key returns string", () => {
		const response = getCacheKeyTransactionsForAddress({
			query: {
				limit: 10,
				offset: 10,
			},
			params: {
				fromOrTo: "test",
				address: "test"
			}
		});

		expect(typeof response).toBe("string");
	});

	test("get balances cache key returns string", () => {
		const response = getCacheKeyBalances({
			params: {
				address: "test"
			}
		});

		expect(typeof response).toBe("string");
	});

	test("getting transactions by block number returns transactions", async () => {
		const alchemy = new Alchemy({
			apiKey: process.env.ALCHEMY_API_KEY,
			network: Network.ETH_MAINNET,
		});

		const transactions = await getDaiTransactionsByBlockNumber(15454022, alchemy);

		expect(typeof transactions).toBe("object");
		expect(transactions.length).toBeGreaterThan(0);
	});

	test("converting bytes32 to address string", async () => {
		const address = bytes32ToAddressString("0x00000000000000000000000060594a405d53811d3bc4766596efd80fd545a270");
		expect(address).toBe("0x60594a405d53811d3BC4766596EFD80fd545A270");
	});

	test("converting bytes32 to int string", async () => {
		const intString = bytes32ToIntString("0x0000000000000000000000000000000000000000000003d9ee1a3815a8600000");
		expect(intString).toBe("18187200000000000000000");
	});

	test("moving decimal 18 places and format for int string", async () => {
		const address = moveDecimalAndFormat("18187267800000000000000");
		expect(address).toBe("18187.27");
	});
});