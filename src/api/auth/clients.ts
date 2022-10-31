import { IApiClient } from "../../common/types";

// Mocked here for now but this should ideally be in a database
// If this were a real project this file should not get committed to the repo
const apiClients: IApiClient[] = [
	{
		"client_id": "123",
		"api_key": "59bee382d6ef71e4d5a355c9cc0e1ec975203d07fd321e07db1fef06fc4f23bd",
	},
	{
		// e2e tests
		"client_id": "456",
		"api_key": "35dc55759cb5e74742b189bf2b52758993664243b2a34f2694d723948598a11d",
	}
];

export { apiClients };
