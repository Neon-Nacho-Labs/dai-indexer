# DAI Indexer

A personal project to index transactions from the Dai contract on the Ethereum mainnet.

### Overview

This application uses Node.js and Express.js to power the backend, pulling in a number of different node modules where needed. It employs response caching, request logging, pagination, API key enforcement, and request rate limiting. It's written in JavaScript, which I chose for simplicity, but will likely rewrite it in TypeScript which I believe is a better option.

It uses the Alchemy SDK to interact with on-chain data and set up a WebSocket connection to subscribe to certain events. The automatic retry handling for WebSocket failures that comes built-in with the SDK was a really nice benefit over manually setting up and handling the connections.

Data is stored in a MySQL database.

For automatted testing it uses the popular Jest testing framework and pulls in Supertest for a few end-to-end tests to make it easier to make real HTTP requests to the API.

API documentation is handled by Swagger/OpenAPI. Once the application is started that documentation is available at http://localhost:3000/api-docs/.

A variety of other Node modules were used for various reasons which can be found directly in the code.

I'm a big fan of keeping things simple whenever possible and only introducing additional complexity when really needed. So the file structure of the project is fairly straightforward, but even that gained some complexity as it evolved. Here's a high-level overview of that structure:

* The main project file is called `app.js` and lives at the root.
* The transaction import code is in [/src/jobs](https://github.com/Neon-Nacho-Labs/dai-indexer/tree/main/src/jobs).
* API routes, handlers, and middleware are in [/src/api](https://github.com/Neon-Nacho-Labs/dai-indexer/tree/main/src/api).
* Application-wide constants are in [/src/common/constants.ts](https://github.com/Neon-Nacho-Labs/dai-indexer/blob/main/src/common/constants.ts).
* Core database code (connection, schemas, helpers) are in [/src/database](https://github.com/Neon-Nacho-Labs/dai-indexer/tree/main/src/database).
* Interactions with data (CRUD operations) are handled in [/src/models](https://github.com/Neon-Nacho-Labs/dai-indexer/tree/main/src/models).
* Some utility functions live under [/src/utils](https://github.com/Neon-Nacho-Labs/dai-indexer/tree/main/src/utils).
* Tests live in [/test](https://github.com/Neon-Nacho-Labs/dai-indexer/tree/main/test).
* Not committed to the repo, but once running, request logs are written to `/log`.

A few things to note about the implementation:

1. My initial implementation was to index all Ethereum transactions for the Dai contract and store the "to" and "from" addresses for those transactions. This however would only give us general data about the transactions but not the specifics about some of the internal events of the contract and it's token. To handle that I added indexing of the event logs fired when calling the "transfer" function, and a new set of endpoints to access the stored data. With that we get specific data about interactions with that function, namely the sender, recipient, and amount.
2. Another change between the transaction-based implementation and the event-log-based implementation is how they handle pagination. The transaction code uses a simple limit/offset approach which has the advantage of simplicity and allowing a user to jump to arbitrary pages. However it's not great for scalability, as the higher the page number (offset) gets, the longer queries will take. The approach changed in the event log code to instead use a "seek" implementation which uses the unique `id` column to step through subsequent pages. This has the advantage of being much more performant for higher page numbers but comes with the downside of not being able to jump to arbitrary pages since the last id of the previous result set is needed – I think this is a worthwhile trade-off.
3. For now, I decided not to save any token balance data in the database since this can change frequently and it's already readily available in the on-chain data and accessible through the Alchemy API. The application does however cache the results for a short time to minimize the number of requests being made to fetch that data. I might consider storing balance data in the database in the future.

### Potential Future Improvements
There are quite a few improvements and areas of further exploration that could be done if I continue working on this application. Here's a list of some that came up during the process of this project, in no particular order:

* Logging requests to Elasticsearch and setting up Kibana or something similar to view, query, and analyze the data. Similarly, build an ETL pipeline to process the logs into a more queryable data store and format.
* More robust API authentication and authorization - maybe using an additional secret or looking into JWT.
* Also index pending transactions.
* Also index Dai on other chains.
* Deploy to heroku to start.
* Combine everything in a Docker container.
* Index and store block data in a separate table.
* Store additional transaction data - gas info, data.
* Explore storing data in a json MySQL data type then auto-generating the columns from that.
* Maybe build in some node redundancy to fallback on in the case our default (Alchemy) fails.
* More robust retry logic when calling external APIs.
* Further research into causes of duplicate transaction hashes
* Build in some performance benchmark tests.
* Look into using the compression module - useful for just an API?
* Listen for requested media type (JSON) and return specific response if no match.
* With pagination, also return the total number of results available.
* Return more descriptive error messages.
* When testing, mock functions and modules so as not to unnecessarily call the database and external APIs.
* Set up a mock database rather than relying on production data.
* Use a more robust caching library (eg. Redis).
* Maybe move caching to middleware.

-----

## Dev Setup

Eventually this will all be contained in a Docker container to make setup for new devs easier. Until we have that, here are the steps to get it up and running.

* Clone the repo and install dependencies:
```
git clone https://github.com/Neon-Nacho-Labs/dai-indexer.git
cd dai-indexer
npm install
```
* Set up a local MySQL database named `dai_indexer` and create the tables from the schemas in [src/database/schemas](https://github.com/Neon-Nacho-Labs/dai-indexer/tree/main/src/database/schemas).
* Copy `/.env-example` to `/.env` and enter your Alchemy API key, and MySQL user and pass.
* Start the importer job:
```
npm run start-import
```
* After a few moments verify that data is being written to both the `dai_event_logs` and `transactions` tables.
* Start the API:
```
npm run dev
```
* Make a test request to the API:
```
curl -X GET -H "Content-Type: application/json" -H "X-API-KEY: 59bee382d6ef71e4d5a355c9cc0e1ec975203d07fd321e07db1fef06fc4f23bd" "http://localhost:3000/api/v1/transactions?limit=5"
```
* Run tests
```
npm run test
```
