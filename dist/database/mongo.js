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
exports.signUp = signUp;
exports.signIn = signIn;
exports.getAll = getAll;
exports.verifyEmail = verifyEmail;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect("mongodb://localhost:27017/userdetails");
const { Schema, model } = mongoose_1.default;
const UserDetails = new Schema({
    name: String,
    email: String,
    phoneNumber: String,
    password: String,
    imageUrl: String,
    isVerified: {
        email: {
            otp: { type: Boolean, default: false },
            actualOtp: { type: String },
        },
        phoneNumber: { type: Boolean, default: false },
    },
});
const User = model("UserDetails", UserDetails);
function signUp(data, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield User.create({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            imageUrl: data.imageUrl,
            password: data.password,
            isVerified: {
                email: {
                    actualOtp: otp,
                },
            },
        });
        return response;
    });
}
function signIn(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield User.findOne({
            phoneNumber: data.phoneNumber,
            password: data.password,
        });
        return response;
    });
}
function getAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield User.find();
        return response;
    });
}
// Adjust the import path according to your project structure
function verifyEmail(email, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const user = yield User.findOne({ email: email });
            if (((_b = (_a = user === null || user === void 0 ? void 0 : user.isVerified) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.actualOtp) === otp) {
                const updatedUser = yield User.updateOne({ email: email }, { $set: { "isVerified.email.otp": true } });
                return {
                    success: true,
                    message: "Email verified successfully",
                    updatedUser,
                };
            }
            else {
                return {
                    success: false,
                    message: "Invalid OTP",
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: "An error occurred during email verification",
                error: error,
            };
        }
    });
}
