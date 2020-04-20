const { MongoClient } = require("mongodb");

exports.handler = async (event, context) => {
	const hash = event.queryStringParameters.h;
	// if no url...
	if (!hash) {
		return {
			statusCode: 400,
			body: "Missing hash"
		};
	}

	context.callbackWaitsForEmptyEventLoop = false;

	const connection = await MongoClient.connect(process.env.MONGO_URI, {
		useUnifiedTopology: true
	});

	const db = connection.db(process.env.MONGO_DB);
	const collection = db.collection("redirs");

	const redisObject = await collection.findOne({ hash });

	if (!redisObject) {
		return {
			statusCode: 404,
			body: "Nothing found"
		};
	}

	/* return {
		statusCode: 200,
		body: JSON.stringify(redisObject, undefined, 2)
	}; */

	return {
		statusCode: 301,
		headers: {
			Location: redisObject.url
		}
	};
};
