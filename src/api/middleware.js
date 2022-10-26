import {
	RESPONSE_BAD_REQUEST,
	RESPONSE_MISSING_KEY,
	RESPONSE_INVALID_KEY,
	RESPONSE_TOO_MANY_REQUESTS,
	RATE_LIMIT_CACHE_TTL_IN_SECONDS,
	RATE_LIMIT_REQUESTS_PER_TIME_PERIOD
} from "../config/constants.js";
import { getResponseObject, getApiClient, getCacheKeyRateLimit } from "../utils/helpers.js";
import { appCache } from "../utils/cache.js";

/**
 * Middleware to check for a valid API key
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The next() function
 */
function keyCheck(req, res, next) {
	if (!req.headers["x-api-key"]) {
		res.status(400).json(
			getResponseObject(res.statusCode, RESPONSE_MISSING_KEY)
		);
		return;
	}

	const apiClient = getApiClient(req.headers["x-api-key"]);

	if (!apiClient) {
		res.status(403).json(
			getResponseObject(res.statusCode, RESPONSE_INVALID_KEY)
		);
		return;
	}

	// Successful passed checks
	next();
}

/**
 * Middleware to check for valid limit and offset URL query params
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The next() function
 */
function limitOffsetValidation(req, res, next) {
	if (
		(req.query.limit && isNaN(req.query.limit))
		|| (req.query.offset && isNaN(req.query.offset))
	) {
		res.status(400).json(
			getResponseObject(res.statusCode, RESPONSE_BAD_REQUEST)
		);
		return;
	}

	next();
}

/**
 * Middleware to check for valid limit and lastid URL query params
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The next() function
 */
function limitLastIdValidation (req, res, next) {
	if (
		(req.query.limit && isNaN(req.query.limit))
		|| (req.query.lastid && isNaN(req.query.lastid))
	) {
		res.status(400).json(
			getResponseObject(res.statusCode, RESPONSE_BAD_REQUEST)
		);
		return;
	}

	next();
}

/**
 * Middleware to check for a valid fromOrTo request param
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The next() function
 */
function toFromValidation (req, res, next) {
	if (!["to", "from"].includes(req.params.fromOrTo)) {
		res.status(400).json(
			getResponseObject(res.statusCode, RESPONSE_BAD_REQUEST)
		);
		return;
	}

	next();
}

/**
 * Middleware to handle API request rate limiting
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {function} next The next() function
 */
function rateLimit(req, res, next) {
	const cacheKey = getCacheKeyRateLimit(req);
	const result = appCache.get(cacheKey);

	if (!result) {
		// First request within RATE_LIMIT_CACHE_TTL_IN_SECONDS - set request count to 1
		appCache.set(cacheKey, 1, RATE_LIMIT_CACHE_TTL_IN_SECONDS);
		next();
	} else {
		if (result < RATE_LIMIT_REQUESTS_PER_TIME_PERIOD) {
			// Increment request count, keeping the original TTL
			const currentTTL = appCache.getTtl(cacheKey);
			appCache.set(cacheKey, result + 1, (currentTTL - Date.now()) / 1000);
			next();
		} else {
			// Request count has been exceeded - deny the request
			res.status(429).json(
				getResponseObject(res.statusCode, RESPONSE_TOO_MANY_REQUESTS)
			);
		}
	}
}

export {
	keyCheck,
	limitOffsetValidation,
	limitLastIdValidation,
	toFromValidation,
	rateLimit
};