"use strict";

const Hapi = require("@hapi/hapi");
const server = new Hapi.Server();
const routes = require("./routes");
const conf = require("./conf");
const mongoose = require("mongoose");

const mongoseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

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
	mongoose.connect(conf.MONGO_URI, mongoseOptions);
	const db = mongoose.connection;
	db.on("error", () => {
		console.error.bind(console, "connection error:");
		process.exit(1);
	});

	db.once("open", async () => {
		// we're connected!

		// Connection hapi
		await server.start();
		console.log("Server running on %s", server.info.uri);
	});
};

process.on("unhandledRejection", err => {
	console.log(err);
	process.exit(1);
});

init();
