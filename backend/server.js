require('dotenv').config();
const path = require('path');
const colors = require('colors/safe');

const PORT = process.env.PORT || 7000;
const HOST = process.env.HOST || 'localhost';
const MONGO_URI = process.env.MONGO_URI;

const PUBLIC_PATH = path.join(__dirname, '..', 'public');

const spaces = (num) => Array(num).join(' ');
function logRoutes(routes) {
  console.log(colors.blue('Routes'));
  for (const [url, obj] of routes.entries()) {
    const methods = Object.keys(obj)
      .map((m) => m.toUpperCase())
      .sort((a, b) => a.localeCompare(b))
      .join(', ');
    console.log(`${colors.blue(url)}${spaces(30 - url.length)}${methods}`);
  }
}

const init = async () => {
  const fastify = require('fastify')({
    logger: true,
  });
  fastify.register(require('fastify-log'));
  fastify.register(require('fastify-routes'));

  fastify.register(require('fastify-mongodb'), {
    // force to close the mongodb connection when app stopped
    // the default value is false
    forceClose: true,

    url: MONGO_URI,
  });
  fastify.register(require('fastify-static'), {
    root: PUBLIC_PATH,
    wildcard: false,
  });
  // Routes
  await fastify.register(require('./routes'));

  /* fastify.get('/', async (request, reply) => {
    reply.sendFile('index.html');
  }); */

  try {
    await fastify.listen({ port: PORT });
  } catch (err) {
    fastify.log.fatal(err);
    process.exit(1);
  }

  logRoutes(fastify.routes);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
