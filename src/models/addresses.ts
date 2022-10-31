import { Alchemy, Network, TokenBalancesResponse } from "alchemy-sdk";
import { DAI_CONTRACT_ADDRESS } from "../common/constants";
import "dotenv/config";

const alchemy: Alchemy = new Alchemy({
	apiKey: process.env.ALCHEMY_API_KEY,
	network: Network.ETH_MAINNET,
});

/**
 * Get the Dai balance for an address
 * We're not storing balances in our local db, but rather we query the contract and cache the results
 *
 * @param {string} address An Ethereum address
 * @returns {string} The Dai balance of the address
 */
async function getDaiBalance(address: string): Promise<string | boolean> {
	let balances: TokenBalancesResponse = await alchemy.core.getTokenBalances(address, [DAI_CONTRACT_ADDRESS]);

	if (!balances || !Array.isArray(balances.tokenBalances)) {
		return false;
	}

	// Get an integer string from the hex value
	const intBalanceAsString: string = BigInt(balances.tokenBalances[0].tokenBalance).toString();

	return intBalanceAsString;
}

export { getDaiBalance };