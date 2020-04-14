require("dotenv").config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const BASE_URL = `http://${HOST}:${PORT}`;
const MONGO_URI = process.env.MONGO_URI;

module.exports = {
	MONGO_URI,
	PORT,
	HOST,
	BASE_URL
};
