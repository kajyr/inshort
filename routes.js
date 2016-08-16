const Joi        = require('joi');  
const mongoose   = require('mongoose');  
const Schema     = mongoose.Schema;  
const createHash = require('./createhash');  
const conf = require('./conf');  


/* CREATING MONGOOSE SCHEMAS
================================================*/

const redirSchema = new Schema({  
	shortUrl: String,
	url: String,
	createdAt: Date
});

const Redir = mongoose.model('Redir', redirSchema); 

module.exports = [  
{
	method: 'GET',
	path: '/',
	handler(request, reply) {
		reply.file('views/index.html');
	}
},
{
	method: 'GET',
	path: '/public/{file}',
	handler(request, reply) {
		reply.file(`public/${request.params.file}`);
	}
},
{
	method: 'POST',
	path: '/new',
	handler(request, reply) {
		const uniqueID = createHash();
		const newRedir = new Redir({
			shortUrl: `${conf.BASE_URL}/${uniqueID}`,
			url: request.payload.url,
			createdAt: new Date()
		});

		newRedir.save((err, redir) => {
			if (err) { reply(err); } else { reply(redir); }
		});
	},
	config: {
		validate: {
			payload: {
				url: Joi.string()
				.regex(/^https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
				.required()
			}
		}
	}
},
{
	method: 'GET',
	path:'/{hash}',
	handler(request, reply) {
		const query = {
			'shortUrl': `${conf.BASE_URL}/${request.params.hash}`
		};

		Redir.findOne(query, (err, redir) => {
			if (err) { return reply(err); }
			else if (redir) { reply().redirect(redir.url); }
			else { reply.file('views/404.html').code(404); }
		});
	}
}
];
