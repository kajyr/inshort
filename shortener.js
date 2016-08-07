'use strict';

require('dotenv').load();

const Hapi     = require('hapi');  
const server   = new Hapi.Server();  
const routes   = require('./routes');  
const mongoose = require('mongoose');  
const mongoUri = process.env.MONGOURI;  
// If you're testing this locally, change mongoUri to:
// 'mongodb://localhost:27017/shortio'

console.log(mongoUri);

const options = {  
	server: {
		socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
	}, 
	replset: {
		socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 }
	}
};

mongoose.connect(mongoUri, options);
mongoose.Promise = global.Promise;

const db = mongoose.connection; 

server.connection({  
	port: process.env.PORT || 3000,
	routes: { cors: true }
});

server.register(require('inert'), (err) => {  
	db.on('error', console.error.bind(console, 'connection error:'))
	.once('open', () => {
		server.route(routes);

		server.start(err => {
			if (err) throw err;

			console.log(`Server running at port ${server.info.port}`);
		});
	});
});
