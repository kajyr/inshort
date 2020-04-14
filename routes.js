const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const shortid = require("shortid");
const Schema = mongoose.Schema;
const conf = require("./conf");

/* CREATING MONGOOSE SCHEMAS
================================================*/

const URL_REGEXP = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

const redirSchema = new Schema({
	url: String,
	hash: String,
	createdAt: Date
});

const Redir = mongoose.model("Redir", redirSchema);

module.exports = [
	{
		method: "GET",
		path: "/",
		handler: {
			file: "views/index.html"
		}
	},
	{
		method: "GET",
		path: "/public/{file}",
		handler(request, reply) {
			return reply.file(`public/${request.params.file}`);
		}
	},
	{
		method: "POST",
		path: "/new",
		handler: async request => {
			const { url } = request.payload;
			let redisObject = await Redir.findOne({ url });

			if (!redisObject) {
				const uniqueID = shortid.generate();

				const newRedir = new Redir({
					hash: uniqueID,
					url,
					createdAt: new Date()
				});

				redisObject = await newRedir.save();
			}

			return {
				shortUrl: `${conf.BASE_URL}/${redisObject.hash}`,
				createdAt: redisObject.createdAt,
				url: redisObject.url
			};
		},
		options: {
			validate: {
				payload: Joi.object({
					url: Joi.string()
						.regex(URL_REGEXP)
						.required()
				})
			}
		}
	},
	{
		method: "GET",
		path: "/{hash}",
		handler: async (request, h) => {
			const query = {
				hash: request.params.hash
			};

			const redisObject = await Redir.findOne(query);
			if (redisObject) {
				return h.redirect(redisObject.url);
			} else {
				return h.file("views/404.html").code(404);
			}
		}
	}
];
