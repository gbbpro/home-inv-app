import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const token = req.cookies.token; // Get token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized access, please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data (username) to request
    next(); // Continue to the next function
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token, please log in again.' });
  }
}
