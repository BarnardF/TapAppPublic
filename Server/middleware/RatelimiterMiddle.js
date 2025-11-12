// sebastian

// controllers - mishka()
const { client } = require("../controllers/RedisClient");

// Allowed amount of request made in a given time frame
const THRESHOLD = 10;

// Time between the last request and the one being currently made
const ALLOWED_TIMEFRAME = 5 * 60 * 1000;

// Time that is set to timeout the user which is 10 minutes
const BLOCK_TIME = THRESHOLD * 60 * 1000;

// normalize IP to standard ipv4
function normIP(ip) {
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) return ip.substring(7);
  if (ip === "::" || ip === "::1") return "127.0.0.1";
  return ip;
}

/*
    This function removes the IP from the ratelimit database.
*/

async function resetRateLimit(req) {
  const rawIP =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket && req.connection.socket.remoteAddress);
  const ip = normIP(rawIP);

  if (!ip) return;

  const result = await client.deleteKey(`ratelimit:${ip}`);
}

/*
    Middleware to enforce requests made by endpoint user

    This function checks if an IP made too many request in a short timespan,
    if too many have been made the IP is blocked with BLOCK_TIME and a
    error message code of (429) is sent to the user. 
*/

async function rateLimitCheck(req, res, next) {
  try {
    const rawIP = req.connection.remoteAddress;
    !!req.socket.remoteAddress ||
      (req.connection.socket && req.connection.socket.remoteAddress);

    const IP = normIP(rawIP);

    if (!IP) {
      return res.status(400).send("Unable to determine IP address");
    }

    let record = await client.hGetAll(`ratelimit:${IP}`);

    console.log(record);

    const now = new Date();

    if (!record || Object.keys(record).length === 0) {
      const ratelimitQ = {
        count: "1",
        lastAttempt: now.getTime().toString(),
        blockedUntil: now.getTime().toString(),
      };

      await client.hSet(`ratelimit:${IP}`, ratelimitQ);
      await client.rPush("ratelimits:ids", IP);
      return next();
    }

    const nowTimestamp = now.getTime(); // use timestamp in ms

    // Convert Redis fields from strings to numbers
    const blockedUntil = parseInt(record.blockedUntil);
    let count = parseInt(record.count);
    const lastAttempt = parseInt(record.lastAttempt);

    // Check if currently blocked
    if (blockedUntil > nowTimestamp) {
      const waitTime = Math.ceil((blockedUntil - nowTimestamp) / 1000);
      return res.status(429).send("Too many requests, try again later");
    }

    console.log("not currently blocked")
    
    const timeSinceLastAttempt = nowTimestamp - lastAttempt;

    if (timeSinceLastAttempt > ALLOWED_TIMEFRAME) {
      count = 1; 
    } else {
      count += 1; 
    }


    const newBlockedUntil =
      count > THRESHOLD ? nowTimestamp + BLOCK_TIME : blockedUntil;


    await client.hSet(`ratelimit:${IP}`, {
      count: count.toString(),
      lastAttempt: nowTimestamp.toString(),
      blockedUntil: newBlockedUntil.toString(),
    });

    await client.rPush("ratelimits:ids", IP);

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next();
  }
}

module.exports = { rateLimitCheck, resetRateLimit };
