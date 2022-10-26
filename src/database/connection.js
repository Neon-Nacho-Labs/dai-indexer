import mysql from "mysql2/promise";
import "dotenv/config";

const MYSQL_DB_NAME = "dai_indexer";
const MYSQL_TABLE_TRANSACTIONS = MYSQL_DB_NAME + ".transactions";
const MYSQL_TABLE_DAI_EVENT_LOGS = MYSQL_DB_NAME + ".dai_event_logs";

// Get a database connection using connection pooling
const dbConnection = mysql.createPool({
	connectionLimit: 150, // DB limit - 1
	host: "localhost",
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: MYSQL_DB_NAME
});

export { dbConnection, MYSQL_TABLE_TRANSACTIONS, MYSQL_TABLE_DAI_EVENT_LOGS };