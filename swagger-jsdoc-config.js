const swaggerJSDocOptions = {
	definition: {
		openapi: "3.0.3",
		info: {
		title: "A Dai transaction API",
		version: "0.1.0",
		description:
			"This API provides transaction and balance data about the Dai stable coin on the Ethereum mainnet",
		license: {
			name: "MIT",
			url: "https://spdx.org/licenses/MIT.html",
		},
		contact: {
			name: "Travis",
		},
		},
		servers: [
		{
			url: "http://localhost:3000/api/v1",
		},
		],
	},
	apis: ["./src/api/routes.js"],
};

export default swaggerJSDocOptions;