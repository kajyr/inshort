require('dotenv').load();

const PORT			= process.env.PORT || 3000
const BASE_URL   	= process.env.BASE_URL || 'http://localhost:' + PORT;
const MONGO_URI	= process.env.MONGOURI;  

module.exports = {
	MONGO_URI:MONGO_URI,
	PORT: PORT,
	BASE_URL: BASE_URL
}
