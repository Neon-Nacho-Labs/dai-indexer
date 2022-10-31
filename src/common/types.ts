import { RowDataPacket } from "mysql2/promise";

interface IQueryResultDaiEventLogs extends RowDataPacket {
	id: number,
	from_address: string,
	to_address: string,
	raw_value: string,
	value: string,
	transaction_hash: string,
	event_signature: string,
	event_name: string,
	inserted_at: string,
}

interface IQueryResultTransactions extends RowDataPacket {
	id: number,
	hash: string,
	from_address: string,
	to_address: string,
	value: string,
	block_number: number,
	inserted_at: string,
}

interface IApiClient {
	client_id: string,
	api_key: string,
}

export {
	IQueryResultDaiEventLogs,
	IQueryResultTransactions,
	IApiClient
}