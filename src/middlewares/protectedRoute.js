import jwt from "jsonwebtoken";

export function protectedRoute(handler) {
  return async (req, res) => {
    const token = req.cookies?.token; // Read the token from cookies

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user data to the request
      return handler(req, res); // Proceed with the original handler
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
