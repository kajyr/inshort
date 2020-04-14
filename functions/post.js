const mongo = require("../db");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let conn = null;

exports.handler = async event => {
	// Only allow POST
	if (event.httpMethod !== "POST") {
		return {
			statusCode: 405,
			body: "Method Not Allowed"
		};
	}

	await mongo();

	return {
		statusCode: 200,
		body: `Hello ${subject}!`
	};
};
