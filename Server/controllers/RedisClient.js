
const {createClient} = require('redis');
const url = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({url});

client.on('error',(err) => console.error('Redis Client Error',err));

async function connect() {
    if (!client.isOpen) await client.connect();
}

module.exports = {client, connect};