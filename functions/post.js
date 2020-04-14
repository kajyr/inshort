const { MongoClient } = require("mongodb");

let connection = null;

exports.handler = async (event, context, callback) => {
	// Only allow POST
	if (event.httpMethod !== "POST") {
		return {
			statusCode: 405,
			body: "Method Not Allowed"
		};
	}
	//the following line is critical for performance reasons to allow re-use of
	// database connections across calls to this Lambda function and avoid closing
	// the database connection. The first call to this lambda function takes about
	// 5 seconds to complete, while subsequent,
	// close calls will only take a few hundred milliseconds.
	context.callbackWaitsForEmptyEventLoop = false;

	// When the method is POST, the name will no longer be in the event’s
	// queryStringParameters – it’ll be in the event body encoded as a query string
	const params = JSON.parse(event.body);
	const { url } = params;

	if (!url) {
		return {
			statusCode: 400
		};
	}

	try {
		if (!connection) {
			connection = await MongoClient.connect(process.env.MONGO_URI, {
				useUnifiedTopology: true
			});
		}

		const db = connection.db(process.env.MONGO_DB);
		const collection = db.collection("redirs");

		let redisObject = await collection.findOne({ url });

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
			shortUrl: `/${redisObject.hash}`,
			createdAt: redisObject.createdAt,
			url: redisObject.url
		};

		callback(null, {
			statusCode: 201,
			body: JSON.stringify(ret)
		});
	} catch (e) {
		callback({
			statusCode: 500,
			body: JSON.stringify(e)
		});
	}
};
