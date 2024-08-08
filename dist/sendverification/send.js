"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
exports.sendOtp = sendOtp;
exports.generateOTP = generateOTP;
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: "matheshrajudev@gmail.com",
        pass: "wkaj noad olta stia",
    },
});
function sendMail(receivermail, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield transporter.sendMail({
            from: '"From Matheshraju" <matheshrajudev@gmail.com>',
            to: receivermail,
            subject: "Verify Your Account",
            text: "Your Verification Code",
            html: `<b>Your Verification Code is:${otp}</b>`,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    });
}
const accountSid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const authToken = "your_auth_token";
const client = (0, twilio_1.default)(accountSid, authToken);
function sendOtp(senderNumber, receiverNumber, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield client.messages.create({
            body: `Your Verification Code is: ${otp}`,
            to: receiverNumber,
            from: senderNumber,
        });
        return response;
    });
}
function generateOTP(length) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}
