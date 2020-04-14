const { MongoClient } = require("mongodb");

exports.handler = async event => {
	const url = event.queryStringParameters.url;
	// if no url...
	if (!url) {
		return {
			statusCode: 400,
			body: "Missing URL"
		};
	}

	const connection = await MongoClient.connect(process.env.MONGO_URI, {
		useUnifiedTopology: true
	});

	const db = connection.db("inshort");
	const collection = db.collection("redirs");

	const redisObject = await collection.findOne({ url });

	if (!redisObject) {
		return {
			statusCode: 404,
			body: "Nothing found"
		};
	}

	return {
		statusCode: 200,
		body: JSON.stringify(redisObject, undefined, 2)
	};
};
