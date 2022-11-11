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

interface IEventLogsReturn {
	"eventLogs": IQueryResultDaiEventLogs[],
	"count": number,
	"lastId": number
}

interface IEthereumEventLog {
	blockNumber: number,
	blockHash: string,
	transactionIndex: number,
	removed: boolean,
	address: string,
	data: string,
	topics: string[],
	transactionHash: string,
	logIndex: number
}

interface IEventLogSubscriptionFilter {
	address: string,
	topics: string[]
}

type FormattedEventLog = [
	string,
	string,
	string,
	string,
	string,
	string,
	"Transfer" // we're only storing transfer events for now
];

export {
	IQueryResultDaiEventLogs,
	IQueryResultTransactions,
	IApiClient,
	IEventLogsReturn,
	IEthereumEventLog,
	IEventLogSubscriptionFilter,
	FormattedEventLog
}