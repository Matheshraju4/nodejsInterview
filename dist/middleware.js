"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = "your_secret_key"; // Replace with your actual secret key
function generateToken(email) {
    const payload = {
        email,
    };
    const token = jsonwebtoken_1.default.sign(payload, secretKey);
    return token;
}
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Access token is missing" });
    }
    jsonwebtoken_1.default.verify(token, secretKey, (err, email) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        //@ts-ignore
        req.email = email;
        next();
    });
}
