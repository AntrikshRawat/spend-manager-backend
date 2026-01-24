const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const getHeaderToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    return token;
  }
  return null;
};

const verifyUser = async (req, res, next) => {
  let token = req.cookies.authToken;
  if (!token) {
    token = getHeaderToken(req);
     if(!token || String(token).length === 0) {
     return res
      .status(401)
      .json({ message: "Your Token is Expired! Please Login Again." });
     }
  }
  let user;
  try {
    user = await jwt.verify(token, secret);
  } catch (e) {
    return res.status(401).json({ message: "Malformed token." });
  }
  if (!user) {
    return res
      .status(501)
      .json({ message: "Unauthorized Access! Not Allowed" });
  }
  req.userId = user.id;
  next();
};

module.exports = verifyUser;
