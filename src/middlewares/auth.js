import jwt from "jsonwebtoken";
import eventEmitter from "../utils/logging.js";
import prisma from "../configs/db.js";

const auth = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user found for provided token" });
    }

    req.user = user;
    next();
  } catch (error) {
    eventEmitter.emit("logging", `JWT verification error: ${error.message}`);
    return res.status(401).json({ message: `Invalid token: ${error.message}` });
  }
};

export default auth;
