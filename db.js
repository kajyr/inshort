const mongoose = require("mongoose");
const conf = require("./conf");

const mongoseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

let db;

const redirSchema = new Schema({
	url: String,
	hash: String,
	createdAt: Date
});

module.exports = {
	model: () => mongoose.model("Redir", redirSchema),
	connect: () => {
		// Setup connectiojn Mongo
		mongoose.connect(conf.MONGO_URI, mongoseOptions);

		if (db) {
			return Promise.resolve(db);
		}

		return new Promise((resolve, rej) => {
			db = mongoose.connection;
			db.on("error", () => {
				rej("connection error:");
			});

			db.once("open", async () => {
				// we're connected!
				resolve(db);
			});
		});
	}
};
