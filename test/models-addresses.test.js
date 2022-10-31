import { getDaiBalance } from "../src/models/addresses";
import { dbConnection } from "../src/database/connection";

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

	test("getting balance returns a balance", async () => {
		const balance = await getDaiBalance("0x6B175474E89094C44Da98b954EedeAC495271d0F");

		expect(typeof balance).toBe("string");
		expect(parseInt(balance)).toBeGreaterThan(-1);
	});
});