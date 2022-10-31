/**********
 *
 * Import transactions from the Dai contract on the Ethereum mainnet
 * and save a subset of data in the database
 *
 * To start:
 *   npm run start-import
 * To stop:
 *   npm run stop-import
 * To view processes
 *   npx pm2 ls
 * To watch output logs:
 *   tail -f ~/.pm2/logs/transaction-importer-out.log
 * To watch error logs:
 *   tail -f ~/.pm2/logs/transaction-importer-error.log
 */

import { Alchemy, Network } from "alchemy-sdk";
import { saveTransactions } from "../models/transactions.js";
import { getDaiTransactionsByBlockNumber } from "../utils/helpers";
import { saveDaiEventLog } from "../models/dai-event-logs.js";
import { DAI_CONTRACT_ADDRESS, EVENT_SIGNATURE_TRANSFER } from "../common/constants";
import "dotenv/config";

const alchemy = new Alchemy({
	apiKey: process.env.ALCHEMY_API_KEY,
	network: Network.ETH_MAINNET,
});

/**
 * Subscription to new blocks on Ethereum mainnet
 */
alchemy.ws.on("block", (blockNumber) => {
	// Get all Dai transaction in the block
	getDaiTransactionsByBlockNumber(blockNumber, alchemy).then(transactions => {
		if (transactions.length < 1 ) {
			// No Dai transactions in block, move on
			return;
		}

		// Save to the DB
		saveTransactions(transactions);
	});
});

const filter = {
	address: DAI_CONTRACT_ADDRESS,
	topics: [
		EVENT_SIGNATURE_TRANSFER
	]
};

/**
 * Subscribe to Transfer() events from the Dai contract
 */
alchemy.ws.on(filter, (log) => {
	// Emitted whenever a DAI token transfer occurs
	saveDaiEventLog(log);
});
