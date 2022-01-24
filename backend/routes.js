const { nanoid } = require('nanoid');

const format = ({ hash, createdAt, url, hits = 0 }) => ({ hash, createdAt, url, hits });

module.exports = function (fastify, opts, done) {
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

        const [found] = await fastify.db.find({ url });

        if (found) {
          return format(found);
        }

        const uniqueID = nanoid(6);

        const newUrl = {
          hash: uniqueID,
          url,
          createdAt: new Date(),
          hits: 0,
        };

        await fastify.db.append(newUrl);

        return format(newUrl);
      },
    },
  ];

  routes.forEach((route) => {
    fastify.route(route);
  });

  fastify.route({
    method: 'GET',
    path: '/:hash',
    handler: async function (request, reply) {
      const { hash } = request.params;

      const [found] = await fastify.db.find({ hash });

      if (found) {
        const updateDoc = {
          ...found,
          hits: Number(found.hits) + 1,
        };
        await fastify.db.update({ hash }, updateDoc);

        reply.redirect(301, found.url);
        return;
      }
      reply.redirect(`${request.protocol}://${request.hostname}/404.html`);
      return;
    },
  });

  fastify.route({
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
      const collection = await fastify.db.find();

      return collection.map(format);
    },
  });

  done();
};
