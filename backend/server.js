require('dotenv').config();
const path = require('path');

const PORT = process.env.PORT || 7000;

const PUBLIC_PATH = path.join(__dirname, '..', 'public');

const init = async () => {
  if (!process.env.DATA) {
    console.log('DATA environment variable is not set');
    process.exit(1);
  }

  console.log('Data file:', process.env.DATA);

  const fastify = require('fastify')({
    logger: true,
  });
  fastify.register(require('fastify-routes-table'));
  fastify.register(require('fastify-log'));
  fastify.register(require('./csv-db'), { file: process.env.DATA });
  fastify.register(require('fastify-static'), {
    root: PUBLIC_PATH,
    wildcard: false,
  });
  // Routes
  await fastify.register(require('./routes'));

  fastify.get('/', async (request, reply) => {
    reply.sendFile('404.html');
  });

  try {
    await fastify.listen({ port: PORT });
  } catch (err) {
    fastify.log.fatal(err);
    process.exit(1);
  }

  fastify.logRoutes();
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
