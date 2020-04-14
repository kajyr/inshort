const mongo = require("../db");

exports.handler = async event => {
	const url = event.queryStringParameters.url;
	// if no url...

	await mongo.connect();

	const model = mongo.model();

	const { url } = request.payload;
	let redisObject = await model.findOne({ url });

	return {
		statusCode: 200,
		body: JSON.stringify(redisObject, undefined, 2)
	};
};
