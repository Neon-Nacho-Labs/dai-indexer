import express from "express";
import { router } from "./src/api/routes.js";
import morgan from "morgan";
import { getApiClient } from "./src/utils/helpers";
import * as rfs from "rotating-file-stream";
import path from "path";
import helmet from "helmet";

let app = express();
const port: number = process.env.NODE_ENV ? 80 : 3000;

// set up token to log api client id
morgan.token("client-id", (req) => {
	const apiClient = getApiClient(req.headers["x-api-key"] as string);
	return apiClient?.client_id || undefined;
});

// rotate log files daily
const accessLogStream = rfs.createStream("access.log", {
	interval: "1d",
	path: path.join("./", "log")
});

app.use(morgan(":method :date[clf] :url :status :client-id :response-time", {stream: accessLogStream}));
app.use(helmet());
app.use(router);

app.listen(port, () => {
	console.log(`App started on port ${port}`);
});