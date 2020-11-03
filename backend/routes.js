const { nanoid } = require('nanoid');

const format = ({ hash, createdAt, url }) => ({ hash, createdAt, url });

const routes = [
  {
    method: 'POST',
    url: '/new',
    schema: {
      type: 'object',
      required: ['url', 'apiKey'],
      properties: {
        url: { type: 'string' },
        apiKey: { type: 'string' },
      },
    },
    handler: async function (request, reply) {
      const { url, apiKey } = request.body;
      if (!apiKey || apiKey !== process.env.API_KEY) {
        reply.code(401).send();
        return;
      }
      if (!url) {
        reply.code(400).send();
        return;
      }
      if (!url.match(/^http[s]?:\/\//)) {
        reply.code(405).send();
        return;
      }
      const collection = await this.mongo.db.collection('urls');
      const found = await collection.findOne({ url });

      if (found) {
        return format(found);
      }

      const uniqueID = nanoid(6);

      const newUrl = {
        hash: uniqueID,
        url,
        createdAt: new Date(),
      };

      await collection.insertOne(newUrl);

      return format(newUrl);
    },
  },
  {
    method: 'GET',
    path: '/:hash',
    handler: async function (request, reply) {
      const { hash } = request.params;
      const collection = await this.mongo.db.collection('urls');

      const found = await collection.findOne({ hash });

      if (found) {
        reply.redirect(301, found.url);
        return;
      }
      reply.redirect(`${request.protocol}://${request.hostname}/404.html`);
      return;
    },
  },
  {
    method: 'GET',
    url: '/list/:apiKey',
    schema: {
      type: 'object',
      required: ['url', 'apiKey'],
      properties: {
        url: { type: 'string' },
        apiKey: { type: 'string' },
      },
    },
    handler: async function (request, reply) {
      const { apiKey } = request.params;
      if (!apiKey || apiKey !== process.env.API_KEY) {
        reply.code(401).send();
        return;
      }
      const collection = await this.mongo.db.collection('urls');
      const found = await collection.find({}).toArray();

      return found.map(format);
    },
  },
];

module.exports = function (fastify, opts, done) {
  routes.forEach((route) => {
    fastify.route(route);
  });

  done();
};
