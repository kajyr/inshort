'use strict';

const Hapi     = require('hapi');  
const server   = new Hapi.Server();  
const routes   = require('./routes');  
const conf   	= require('./conf');  
const mongoose = require('mongoose');  

const options = {  
	server: {
		socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
	}, 
	replset: {
		socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 }
	}
};

mongoose.connect(conf.MONGO_URI, options);
mongoose.Promise = global.Promise;


const db = mongoose.connection; 

server.connection({  
	port: conf.PORT,
	routes: { cors: true }
});

server.register(require('inert'), (err) => {  
	db.on('error', console.error.bind(console, 'connection error:'))
	.once('open', () => {
		console.log('Mongo connected at', conf.MONGO_URI)
		server.route(routes);

		server.start(err => {
			if (err) throw err;

			console.log(`Server running at port ${server.info.port}`);
		});
	});
});
