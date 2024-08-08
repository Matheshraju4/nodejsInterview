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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const mongo_1 = require("./database/mongo");
const send_1 = require("./sendverification/send");
const middleware_1 = require("./middleware");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
const upload = (0, multer_1.default)({ dest: "uploads/" });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/getimage", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
app.post("/signup", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = req.body;
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) {
            data.imageUrl = req.file.filename;
        }
        const otp = (0, send_1.generateOTP)(4);
        const response = yield (0, mongo_1.signUp)(data, otp);
        if (response.email) {
            const sendmail = yield (0, send_1.sendMail)(response.email, otp);
            console.log(sendmail);
        }
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify({
                    type: "NEW_USER",
                    user: {
                        email: response.email,
                        phoneNumber: response.phoneNumber,
                        imageUrl: response.imageUrl,
                    },
                }));
            }
        });
        const { email, phoneNumber } = response;
        res.send({ message: "Otp has been Sent", email, phoneNumber });
    }
    catch (error) {
        console.log("on SignUp Something Went Wrong", error);
    }
}));
app.post("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const isVerified = yield (0, mongo_1.verifyEmail)(email, otp);
    res.send(isVerified);
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = req.body;
    const response = yield (0, mongo_1.signIn)(data);
    console.log("signUp", response);
    if (((_b = (_a = response === null || response === void 0 ? void 0 : response.isVerified) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.otp) == false) {
        res.send({ message: "unAuthorised" });
    }
    else if (response === null || response === void 0 ? void 0 : response.email) {
        const getJwt = (0, middleware_1.generateToken)(response.email);
        res.send({ token: getJwt, message: "Authorised" });
    }
}));
app.get("/all", middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, mongo_1.getAll)();
    let clientArray = [];
    response.map((data) => {
        const { email, phoneNumber, imageUrl } = data;
        clientArray.push({ email, phoneNumber, imageUrl });
    });
    res.send(clientArray);
}));
wss.on("connection", (ws) => {
    console.log("Client connected via WebSocket");
    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
        ws.send(`Server received: ${message}`);
    });
    ws.on("close", () => {
        console.log("Client disconnected from WebSocket");
    });
    ws.send("Welcome to the WebSocket server!");
});
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
