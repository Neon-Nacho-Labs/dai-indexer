import { apiClients } from "../api/auth/clients";
import sha256 from "crypto-js/sha256.js";
import Base64 from "crypto-js/enc-base64.js";
import { DAI_CONTRACT_ADDRESS } from "../common/constants";
import Web3 from "web3";
import { IApiClient } from "../common/types.js";
import { Request } from "express";
import { Alchemy } from "alchemy-sdk";
import { TransactionResponse, BlockWithTransactions } from "@ethersproject/abstract-provider";
import { BN } from "bn.js";

const web3 = new Web3();

/**
 * Format response values into an object
 *
 * @param {number} status HTTP response code
 * @param {string} message A response string
 * @param {object|undefined} results The results
 * @returns An response object
 */
function getResponseObject<ResultsType>(
	status: number,
	message: string,
	results: ResultsType
	): {status: number, message: string, results: ResultsType} {
		return {
			status,
			message,
			results
		};
}

/**
 * Get the API client from an API key
 *
 * @param {string} apiKey An API key
 * @returns The API client object or undefined if not found
 */
function getApiClient(apiKey: string): IApiClient {
	return apiClients.find(e => {
		return e.api_key === apiKey;
	});
}

/**
 * Get the sha256 hash of a string
 *
 * @param {string} message
 * @returns A sha256 hash
 */
function getHashString(message: string): string {
	return Base64.stringify(sha256(message));
}

/**
 * Get the cache key to be used for responses to the /transactions endpoint
 *
 * @param {object} req The request object
 * @returns A cache key string
 */
function getCacheKeyTransactions(req: Request): string {
	return getHashString("transactions" + req.query.limit + req.query.offset);
}

/**
 * Get the cache key to be used for responses to the /transactions/:fromOrTo/:address endpoint
 *
 * @param {object} req The request object
 * @returns A cache key string
 */
function getCacheKeyTransactionsForAddress(req: Request): string {
	return getHashString("transactions" + req.params.fromOrTo + req.params.address + req.query.limit + req.query.offset);
}

/**
 * Get the cache key to be used for responses to the /balances endpoint
 *
 * @param {object} req The request object
 * @returns A cache key string
 */
function getCacheKeyBalances(req: Request): string {
	return getHashString("balance" + req.params.address);
}

/**
 * Get the cache key to be used for responses to the /eventlogs/dai endpoint
 *
 * @param {object} req The request object
 * @returns A cache key string
 */
 function getCacheKeyEventLogs(req: Request): string {
	return getHashString("eventlogs" + req.query.limit + req.query.offset);
}

/**
 * Get the cache key to be used for responses to the /eventlogs/dai/:fromOrTo/:address endpoint
 *
 * @param {object} req The request object
 * @returns A cache key string
 */
function getCacheKeyEventLogsForAddress(req: Request): string {
	return getHashString("eventlogs" + req.params.fromOrTo + req.params.address + req.query.limit + req.query.offset);
}

/**
 * Get the cache key to be used for rate limiting per API key
 *
 * @param {object} req The request object
 * @returns A cache key string
 */
 function getCacheKeyRateLimit(req: Request): string {
	return getHashString("ratelimit" + req.headers["x-api-key"]);
}

/**
 * Get a list of transactions in a specific block and return those that transacted with the Dai contract
 * TODO: Maybe move somewhere else
 *
 * @param {number} blockNumber The block number to query transactions for
 * @param {Alchemy} alchemy An Alchemy instance
 * @returns {Array} An array of transactions on the Dai contract
 */
 async function getDaiTransactionsByBlockNumber(blockNumber: number, alchemy: Alchemy): Promise<TransactionResponse[] | []> {
	let block: BlockWithTransactions = await alchemy.core.getBlockWithTransactions(blockNumber);

	let daiTransactions: TransactionResponse[] = block?.transactions?.filter(transaction => {
		return transaction.to === DAI_CONTRACT_ADDRESS;
	});

	return daiTransactions || [];
}

/**
 * Strip the leading 12 bytes (24 zeros) from the string
 * Storage slots on the EVM are 32 bytes (64 chars). Addresses are 20 bytes (40 chars)
 *
 * @param {string} bytes32Value A 64 character hex string with the leading "0x"
 * @returns {string} An Ethereum address as a string
 */
function bytes32ToAddressString(bytes32Value: string): string {
	return web3.utils.toChecksumAddress(
		bytes32Value.replace( /^0x000000000000000000000000/, "0x")
	);
}

/**
 * Convert a 32 byte hex string to a int string
 *
 * @param {string} bytes32Value A 64 character hex string with the leading "0x"
 * @returns {string} An integer as a string
 */
function bytes32ToIntString(bytes32Value: string): string {
	return web3.utils.toBN(bytes32Value).toString();
}

/**
 * Move the decimal place to the left
 * Defaults to 18 decimal places for Dai
 * Formats to only two decimal places
 *
 * @param {string|number} value
 * @returns {string} A number as a string
 */
function moveDecimalAndFormat(value: string | number): string {
	//@ts-ignore - disabling type checking for division opertaion for now - code still works
	return (web3.utils.toBN(value) / web3.utils.toBN(1000000000000000000))
		.toLocaleString("en-US", { maximumFractionDigits: 2 })
		.replace(",", "");
}

export {
	getResponseObject,
	getApiClient,
	getHashString,
	getCacheKeyTransactions,
	getCacheKeyTransactionsForAddress,
	getCacheKeyBalances,
	getCacheKeyEventLogs,
	getCacheKeyEventLogsForAddress,
	getDaiTransactionsByBlockNumber,
	bytes32ToAddressString,
	bytes32ToIntString,
	moveDecimalAndFormat,
	getCacheKeyRateLimit
};