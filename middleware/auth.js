import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const roleAuth = (allowedRoles = []) => {
  return async (req, res, next) => {
    //try {
      const token = req.cookies["token"];
      
      // ------------------------------
      // 1. If NO TOKEN → treat as guest
      // ------------------------------
      if (!token) {
        req.user = { role: "guest" };

        // Guest allowed?
        if (allowedRoles.includes("guest")) return next();

        return res.status(401).json({ 
          message: "Not authorized, no token" 
         });
      }

      // ------------------------------
      // 2. Verify token
      // ------------------------------
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // ------------------------------
      // 3. Load user from DB
      // ------------------------------
      const userResult = await pool.query(
        "SELECT user_id, username, email, role FROM users WHERE user_id = $1",
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      req.user = userResult.rows[0];

      // ------------------------------
      // 4. Check role authorization
      // ------------------------------
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    // } catch (error) {
    //   console.error(error);
    //   req.user = { role: "guest" };

    //   if (allowedRoles.includes("guest")) return next();

    //   return res.status(401).json({ message: "Not authorized, token failed" });
    // }
  };
};
