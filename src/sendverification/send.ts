import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAIL_EMAIL,
    pass: process.env.NODE_MAIL_PASSWORD,
  },
});

export async function sendMail(receivermail: string, otp: string) {
  const info = await transporter.sendMail({
    from: '"From Matheshraju" <matheshrajudev@gmail.com>',
    to: receivermail,
    subject: "Verify Your Account",
    text: "Your Verification Code",
    html: `<b>Your Verification Code is:${otp}</b>`,
  });

  console.log("Message sent: %s", info.messageId);
  return info;
}

const accountSid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const authToken = "your_auth_token";

const client = twilio(accountSid, authToken);

export async function sendOtp(
  senderNumber: string,
  receiverNumber: string,
  otp: string
) {
  const response = await client.messages.create({
    body: `Your Verification Code is: ${otp}`,
    to: receiverNumber,
    from: senderNumber,
  });
  return response;
}
export function generateOTP(length: number) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}
