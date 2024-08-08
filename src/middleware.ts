import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
const secretKey = process.env.SECRET_KEY!;

export function generateToken(email: string) {
  const payload = {
    email,
  };

  const token = jwt.sign(payload, secretKey);
  return token;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  jwt.verify(token, secretKey, (err, email) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    //@ts-ignore
    req.email = email;
    next();
  });
}
