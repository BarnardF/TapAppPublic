// Albertus

const jwt = require('jsonwebtoken');

//Gets the user from the JWT
function getUserFromAccessToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  console.log('token:' + token)
  
  if (!token){ console.log('No token'); return null;}

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return decoded.email;
  } catch (err) {
    return null;
  }
}

//Verifies the Access token to see if it is valid
function verifyAccessToken(req, res, next) {

  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  console.log('Access token:' + token)
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalid or expired' });
    req.user = user;
    console.log('auth user:' + req.user.email)
    next();
  }); } catch(err) {
    console.log(err)
  }
}

//Verifies the refresh token to see if it is valid
function verifyRefreshToken(req, res, next) {

  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
}


  module.exports = {
    verifyAccessToken,
    verifyRefreshToken,
    getUserFromAccessToken 
  };