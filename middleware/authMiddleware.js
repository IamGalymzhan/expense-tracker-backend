const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("AUTH MIDDLEWARE RUNNING");
  console.log("REQUEST PATH:", req.path);
  console.log("REQUEST METHOD:", req.method);

  // Get token from header
  const authHeader = req.header("Authorization");
  console.log(
    "Authorization header:",
    authHeader ? `${authHeader.substring(0, 15)}...` : "MISSING"
  );

  // Check if token exists
  if (!authHeader) {
    console.error("Missing Authorization header");
    return res
      .status(401)
      .json({ message: "Authentication required. Missing token." });
  }

  try {
    // Extract token from "Bearer {token}" format
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      console.error("Token format invalid");
      return res.status(401).json({ message: "Invalid token format" });
    }

    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log(
      "JWT_SECRET first few chars:",
      process.env.JWT_SECRET
        ? process.env.JWT_SECRET.substring(0, 3) + "..."
        : "NOT SET"
    );

    // Try to decode token to check structure
    const decodedWithoutVerify = jwt.decode(token);
    console.log(
      "Token structure without verification:",
      JSON.stringify(decodedWithoutVerify)
    );

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("TOKEN VERIFIED SUCCESSFULLY");
      console.log("DECODED TOKEN:", JSON.stringify(decoded));

      // Make sure decoded has an id property
      if (!decoded) {
        console.error("Token verification returned empty decoded object");
        return res.status(401).json({
          message: "Invalid token. Verification returned empty result.",
        });
      }

      if (!decoded.id) {
        console.error("Token verified but missing id property");
        return res.status(401).json({
          message: "Invalid token structure. Missing required user ID.",
          decodedToken: decoded,
        });
      }

      // Add user data to request, ensuring it contains the id property
      req.user = {
        id: decoded.id,
        ...decoded, // Include any other properties from the token
      };

      // Verify that req.user is set properly
      console.log("req.user set to:", JSON.stringify(req.user));
      console.log("Has user.id?", !!req.user.id);

      // Continue to the next middleware/route handler
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({
        message: "JWT verification failed",
        error: jwtError.message,
        jwtSecretSet: !!process.env.JWT_SECRET,
      });
    }
  } catch (error) {
    console.error("JWT processing error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please login again." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token. Please login again." });
    }

    res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = authMiddleware;
