const redis = require('redis');
const config = require('config');
const client = redis.createClient({
  host: config.get('redis.host'),
  port: config.get('redis.port')
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

const get = (key) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

const set = (key, value, expiration = 3600) => {
  return new Promise((resolve, reject) => {
    client.setex(key, expiration, JSON.stringify(value), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

module.exports = {
  get,
  set
};
