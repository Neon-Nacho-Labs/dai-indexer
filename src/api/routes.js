import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerJSDocOptions from "../../swagger-jsdoc-config.js";
import {
	keyCheck,
	limitOffsetValidation,
	toFromValidation,
	limitLastIdValidation,
	rateLimit
} from "./middleware.js";
import {
	handleTransactionsCall,
	handleTransactionsForAddressCall,
	handleBalancesCall,
	handleEventLogsCall,
	handleEventLogsForAddressCall
} from "./handlers.js";
import { API_BASE_PATH } from "../common/constants.js";

const router = express.Router();

/***********************************************
 * Start open endpoints – no API key requires
 ***********************************************/

/*
 * API documentation (OpenAPI) accessible at /
 * accessible at /api-docs
 */
const swaggerSpecs = swaggerJsdoc(swaggerJSDocOptions);
router.use( "/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/***********************************************
 * End open endpoints
 ***********************************************/

/***********************************************
 * Start authed endpoints – require API key
 ***********************************************/

// Enforce a valid API key for all endpoints below this
router.all("/*", keyCheck);

// Enforce rate limiting for all endpoints below this
router.all("/*", rateLimit);

/**
 * Get a list of the most recent transactions
 * Defaults to the last 100 transactions
 *
 * Example:
 * 	/api/v1/transactions
 * 	/api/v1/transactions?limit=50&offset=100
 *
 * @openapi
 * /transactions:
 *   get:
 *     description: Get a list of the most recent Dai transactions
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: X-API-KEY
 *         in: header
 *         required: true
 *         type: string
 *         description: A valid API key
 *       - name: limit
 *         in: query
 *         required: false
 *         type: string
 *         description: The maximum number of results to return
 *       - name: offset
 *         in: query
 *         required: false
 *         type: string
 *         description: The offset to start the query from – used for pagination
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       403:
 *         description: Missing API key
 *       429:
 *         description: Too many requests – rate limit exceeded
 */
router.get(API_BASE_PATH + "/transactions", [limitOffsetValidation], handleTransactionsCall);

/**
 * Get a list of the most recent transactions for a specific "to" or "from" address
 * Defaults to the last 100 transactions
 *
 * Examples:
 * 	/api/v1/transactions/to/0x6B175474E89094C44Da98b954EedeAC495271d0F
 * 	/api/v1/transactions/from/0x0d2DC51fB872a9f44D5d3a12EF840cc2594818fB?limit=10
 *
 * @openapi
 * /transactions/{from_or_to}/{address}:
 *   get:
 *     description: Get a list of the most recent transactions for a specific "to" or "from" address
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: X-API-KEY
 *         in: header
 *         required: true
 *         type: string
 *         description: A valid API key
 *       - name: from_or_to
 *         in: path
 *         required: true
 *         type: string
 *         description: Which side of the transaction to look up – "from" or "to"
 *       - name: address
 *         in: path
 *         required: true
 *         type: string
 *         description: The Ethereum address to look up
 *       - name: limit
 *         in: query
 *         required: false
 *         type: string
 *         description: The maximum number of results to return
 *       - name: offset
 *         in: query
 *         required: false
 *         type: string
 *         description: The offset to start the query from – used for pagination
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       403:
 *         description: Missing API key
 *       429:
 *         description: Too many requests – rate limit exceeded
 */
router.get(API_BASE_PATH + "/transactions/:fromOrTo/:address", [limitOffsetValidation, toFromValidation], handleTransactionsForAddressCall);

/**
 * Get the Dai balance for an address
 *
 * Example:
 * 	/api/v1/balances/0x6B175474E89094C44Da98b954EedeAC495271d0F
 *
 * @openapi
 * /balances/{address}:
 *   get:
 *     description: Get the Dai balance for an address
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: X-API-KEY
 *         in: header
 *         required: true
 *         type: string
 *         description: A valid API key
 *       - name: address
 *         in: path
 *         required: true
 *         type: string
 *         description: The Ethereum address to look up
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       403:
 *         description: Missing API key
 *       429:
 *         description: Too many requests – rate limit exceeded
 */
router.get(API_BASE_PATH + "/balances/:address", handleBalancesCall);

/**
 * Get a list of the most recent Dai event logs
 * Defaults to the last 100 logs
 * Only returns "Transfer" logs for now
 *
 * Example:
 * 	/api/v1/eventlogs/dai
 * 	/api/v1/eventlogs/dai?limit=50&lastid=100
 *
  * @openapi
 * /eventlogs/dai:
 *   get:
 *     description: Get a list of the most recent Dai event logs
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: X-API-KEY
 *         in: header
 *         required: true
 *         type: string
 *         description: A valid API key
 *       - name: limit
 *         in: query
 *         required: false
 *         type: string
 *         description: The maximum number of results to return
 *       - name: lastid
 *         in: query
 *         required: false
 *         type: string
 *         description: The record of the last id returned in the previous result set – used for pagination
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       403:
 *         description: Missing API key
 *       429:
 *         description: Too many requests – rate limit exceeded
 */
router.get(API_BASE_PATH + "/eventlogs/dai", [limitLastIdValidation], handleEventLogsCall);

/**
 * Get a list of the most recent Dai event logs for a specific "to" or "from" address
 * Defaults to the last 100 logs
 * Only returns "Transfer" logs for now
 *
 * Examples:
 * 	/api/v1/eventlogs/dai/to/0xE592427A0AEce92De3Edee1F18E0157C05861564
 * 	/api/v1/eventlogs/dai/from/0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43?limit=10&lastid=100
 *
 * @openapi
 * /eventlogs/dai/{from_or_to}/{address}:
 *   get:
 *     description: Get a list of the most recent Dai event logs for a specific "to" or "from" address
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: X-API-KEY
 *         in: header
 *         required: true
 *         type: string
 *         description: A valid API key
 *       - name: from_or_to
 *         in: path
 *         required: true
 *         type: string
 *         description: Which side of the transaction to look up – "from" or "to"
 *       - name: address
 *         in: path
 *         required: true
 *         type: string
 *         description: The Ethereum address to look up
 *       - name: limit
 *         in: query
 *         required: false
 *         type: string
 *         description: The maximum number of results to return
 *       - name: lastid
 *         in: query
 *         required: false
 *         type: string
 *         description: The record of the last id returned in the previous result set – used for pagination
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       403:
 *         description: Missing API key
 *       429:
 *         description: Too many requests – rate limit exceeded
 */
router.get(API_BASE_PATH + "/eventlogs/dai/:fromOrTo/:address", [limitLastIdValidation, toFromValidation], handleEventLogsForAddressCall);

/***********************************************
 * End authed endpoints
 ***********************************************/

export { router };