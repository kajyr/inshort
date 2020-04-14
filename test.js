require("dotenv").config();
const { MongoClient } = require("mongodb");
const shortid = require("shortid");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const BASE_URL = `http://${HOST}:${PORT}`;

async function pull() {
	const url = "http://www.nightdrops.com";
	const connection = await MongoClient.connect(process.env.MONGO_URI, {
		useUnifiedTopology: true
	});

	const db = connection.db("inshort");
	const collection = db.collection("redirs");

	const trovato = await collection.findOne({ url });

	console.log(trovato);
}

async function push() {
	const url = "https://www.subnettuno.it";
	const connection = await MongoClient.connect(process.env.MONGO_URI, {
		useUnifiedTopology: true
	});

	const db = connection.db("inshort");
	const collection = db.collection("redirs");

	let redisObject = await collection.findOne({ url });
	console.log("trovato", redisObject);

	if (!redisObject) {
		const uniqueID = shortid.generate();

		redisObject = {
			hash: uniqueID,
			url,
			createdAt: new Date()
		};

		await collection.insertOne(redisObject);
	}

	const ret = {
		shortUrl: `${BASE_URL}/${redisObject.hash}`,
		createdAt: redisObject.createdAt,
		url: redisObject.url
	};
	console.log(ret);
	return ret;
}

push();
