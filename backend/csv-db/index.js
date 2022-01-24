const fp = require('fastify-plugin');
const split2 = require('split2');
const temp = require('temp');
const { pipeline } = require('stream/promises');
const { createReadStream, createWriteStream } = require('fs');

const { Transform, Readable, Writable } = require('stream');
const { rename, appendFile } = require('fs/promises');
temp.track();

const encode = (obj) => `${obj.url},${obj.hash},${obj.hits}\n`;

const lineToObj = () => {
  return new Transform({
    objectMode: true,
    transform(line, encoding, callback) {
      const [url, hash, hits] = line.split(',');
      callback(null, { url, hash, hits });
    },
  });
};

const objToLine = () =>
  new Transform({
    objectMode: true,
    transform(obj, encoding, callback) {
      callback(null, encode(obj));
    },
  });

function match(query, obj) {
  return Object.keys(query).every((key) => query[key] === obj[key]);
}

function find(file) {
  return async (query) => {
    const list = [];

    const extract = new Writable({
      objectMode: true,
      write(obj, _, callback) {
        if (!query || match(query, obj)) {
          list.push(obj);
        }
        callback();
      },
    });

    await pipeline(createReadStream(file), split2(), lineToObj(), extract);

    return list;
  };
}

const updateTrx = (query, updated) =>
  new Transform({
    objectMode: true,
    transform(obj, encoding, callback) {
      if (match(query, obj)) {
        callback(null, updated);
      } else {
        callback(null, obj);
      }
    },
  });

function update(file) {
  return async (query, updated) => {
    const write = temp.createWriteStream();

    await pipeline(
      createReadStream(file),
      split2(),
      lineToObj(),
      updateTrx(query, updated),
      objToLine(),
      write
    );

    await rename(write.path, file);
  };
}

function append(file) {
  return async (obj) => {
    await appendFile(file, encode(obj));
  };
}

function csvDb(instance, options, done) {
  instance.decorate('db', {
    find: find(options.file),
    update: update(options.file),
    append: append(options.file),
  });

  done();
}

module.exports = fp(csvDb, {
  fastify: '3.x',
  name: 'fastify-routes-table',
});
