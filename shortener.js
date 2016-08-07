'use strict';

require('dotenv').load();

const Hapi     = require('hapi');  
const server   = new Hapi.Server();  
const routes   = require('./routes');  
const mongoose = require('mongoose');  
const mongoUri = process.env.MONGOURI;  
// If you're testing this locally, change mongoUri to:
// 'mongodb://localhost:27017/shortio'


const options = {  
  server: {
    socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
  }, 
  replset: {
    socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 }
  }
};

mongoose.connect(mongoUri, options);

const db = mongoose.connection; 