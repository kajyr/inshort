const { MongoClient } = require("mongodb");
const shortid = require("shortid");

const VERSION = "1.0.2";
let connection = null;

function justPost(fn) {
	return (event, context, callback) => {
		if (event.httpMethod !== "POST") {
			callback(null, {
				statusCode: 405,
				body: "Method Not Allowed"
			});
		}
		return fn(event, context, callback);
	};
}

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
		callback(null, {
			statusCode: 400
		});
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
			redisObject = {
				hash: shortid.generate(),
				url,
				createdAt: new Date()
			};

			await collection.insertOne(redisObject);
		}

		const ret = {
			hash: `${redisObject.hash}`,
			createdAt: redisObject.createdAt,
			url: redisObject.url
		};

		callback(null, {
			statusCode: 201,
			body: JSON.stringify(ret)
		});
	} catch (e) {
		callback(e);
	}
};
