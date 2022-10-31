import {
	getResponseObject,
	getCacheKeyTransactions,
	getCacheKeyTransactionsForAddress,
	getCacheKeyBalances,
	getCacheKeyEventLogs,
	getCacheKeyEventLogsForAddress,
	moveDecimalAndFormat
} from "../utils/helpers";
import { getTransactions, getTransactionsForAddress } from "../models/transactions.js";
import { getDaiEventLogs, getDaiEventLogsForAddress } from "../models/dai-event-logs.js";
import { getDaiBalance } from "../models/addresses.js";
import { RESPONSE_SUCCESS, RESPONSE_BAD_REQUEST, CACHE_TTL_IN_SECONDS, RESPONSE_UNKNOWN_ERROR } from "../common/constants";
import { appCache } from "../utils/cache.js";

/**
 * Handler for the /transactions endpoint
 * Get a list of the most recent transactions
 *
 * @param {object} req A request object
 * @param {object} res A response object
 */
async function handleTransactionsCall(req, res) {
	// Check for cached response
	const cacheKey = getCacheKeyTransactions(req);
	if (checkCacheAndRespond(res, cacheKey)) {
		return;
	}

	try {
		const results = await getTransactions(
			parseInt(req.query.limit) || undefined,
			parseInt(req.query.offset) || undefined
		);

		// Cache response for CACHE_TTL_IN_SECONDS seconds
		appCache.set(cacheKey, results, CACHE_TTL_IN_SECONDS);

		respond(res, 200, RESPONSE_SUCCESS, results);
	} catch(error) {
		respond(res, 500, RESPONSE_UNKNOWN_ERROR);
		return;
	}
}

/**
 * Handler for the /transactions/:fromOrTo/:address endpoint
 * Get a list of the most recent transactions for a specific "to" or "from" address
 *
 * @param {object} req A request object
 * @param {object} res A response object
 */
async function handleTransactionsForAddressCall(req, res) {
	// Check for cached response
	const cacheKey = getCacheKeyTransactionsForAddress(req);
	if (checkCacheAndRespond(res, cacheKey)) {
		return;
	}

	try {
		const results = await getTransactionsForAddress(
			req.params.fromOrTo,
			req.params.address,
			parseInt(req.query.limit) || undefined,
			parseInt(req.query.offset) || undefined
		);

		// Cache response for CACHE_TTL_IN_SECONDS seconds
		appCache.set(cacheKey, results, CACHE_TTL_IN_SECONDS);

		respond(res, 200, RESPONSE_SUCCESS, results);
	} catch(error) {
		respond(res, 500, RESPONSE_UNKNOWN_ERROR);
		return;
	}
}

/**
 * Handler for the /balances/:address endpoint
 * Get the Dai balance for an address
 *
 * @param {object} req A request object
 * @param {object} res A response object
 */
async function handleBalancesCall(req, res) {
	// Check for cached response
	const cacheKey = getCacheKeyBalances(req);
	if (checkCacheAndRespond(res, cacheKey)) {
		return;
	}

	try {
		const balance = await getDaiBalance(req.params.address);
		if (false === balance) {
			respond(res, 400, RESPONSE_BAD_REQUEST);
			return;
		}

		const results = {
			"dai_balance_raw": balance,
			"dai_balance": moveDecimalAndFormat(balance)

		};

		// Cache response for CACHE_TTL_IN_SECONDS seconds
		appCache.set(cacheKey, results, CACHE_TTL_IN_SECONDS);

		respond(res, 200, RESPONSE_SUCCESS, results);
	} catch(error) {
		respond(res, 400, error.reason);
		return;
	}
}

/**
 * Handler for the /eventlogs/dai endpoint
 * Get a list of the most recent transactions
 *
 * @param {object} req A request object
 * @param {object} res A response object
 */
 async function handleEventLogsCall(req, res) {
	// Check for cached response
	const cacheKey = getCacheKeyEventLogs(req);
	if (checkCacheAndRespond(res, cacheKey)) {
		return;
	}

	try {
		const results = await getDaiEventLogs(
			parseInt(req.query.limit) || undefined,
			parseInt(req.query.lastid) || undefined
		);

		// Cache response for CACHE_TTL_IN_SECONDS seconds
		appCache.set(cacheKey, results, CACHE_TTL_IN_SECONDS);

		respond(res, 200, RESPONSE_SUCCESS, results);
	} catch(error) {
		respond(res, 500, RESPONSE_UNKNOWN_ERROR);
		return;
	}
}

/**
 * Handler for the /eventlogs/dai/:fromOrTo/:address endpoint
 * Get a list of the most recent transactions for a specific "to" or "from" address
 *
 * @param {object} req A request object
 * @param {object} res A response object
 */
async function handleEventLogsForAddressCall(req, res) {
	// Check for cached response
	const cacheKey = getCacheKeyEventLogsForAddress(req);
	if (checkCacheAndRespond(res, cacheKey)) {
		return;
	}

	try {
		const results = await getDaiEventLogsForAddress(
			req.params.fromOrTo,
			req.params.address,
			parseInt(req.query.limit) || undefined,
			parseInt(req.query.lastid) || undefined
		);

		// Cache response for CACHE_TTL_IN_SECONDS seconds
		appCache.set(cacheKey, results, CACHE_TTL_IN_SECONDS);

		respond(res, 200, RESPONSE_SUCCESS, results);
	} catch(error) {
		respond(res, 500, RESPONSE_UNKNOWN_ERROR);
		return;
	}
}

/**
 * Respond to an API request
 *
 * @param {object} res A response object
 * @param {number} status An HTTP status code
 * @param {string} message A response message
 * @param {object|undefined} results The results to return
 * @returns
 */
function respond(res, status, message, results = undefined) {
	res.status(status).json(
		getResponseObject(res.statusCode, message, results)
	);
	return;
}

/**
 * Check if a specific cache key exists and if so respond with the value at that key
 *
 * @param {object} res A response object
 * @param {string} cacheKey A cache key
 * @returns
 */
function checkCacheAndRespond(res, cacheKey) {
	const cachedResults = appCache.get(cacheKey);
	if (undefined !== cachedResults) {
		respond(res, 200, RESPONSE_SUCCESS, cachedResults);
		return true;
	}

	return false;
}

export {
	handleTransactionsCall,
	handleTransactionsForAddressCall,
	handleBalancesCall,
	handleEventLogsCall,
	handleEventLogsForAddressCall
};