const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // 🍪 Read token from cookie
   //const token = req.cookies.token;

      const authHeader = req.headers.authorization;

    // Check header exists and format is Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }
      
    // Extract token
    const token =
  req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : req.cookies?.token;

    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request
    // decoded can contain:
    // patient → { email, role }
    // staff   → { username, role }
    req.user = decoded;

    next(); // allow request to continue

  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = protect;
