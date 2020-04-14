"use strict";

const Hapi = require("@hapi/hapi");
const routes = require("./routes");
const conf = require("./conf");
const mongo = require("./db");

const init = async () => {
	// Setup hapi
	const server = Hapi.server({
		port: conf.PORT,
		host: conf.HOST,
		routes: { cors: true }
	});
	await server.register(require("@hapi/inert"));
	server.route(routes);

	// Setup connectiojn Mongo
	await mongo.connect();
	console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", err => {
	console.log(err);
	process.exit(1);
});

init();
