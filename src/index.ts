import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import http from "http";
import WebSocket from "ws";
import { getAll, signIn, signUp, verifyEmail } from "./database/mongo";
import { generateOTP, sendMail } from "./sendverification/send";
import { authenticateToken, generateToken } from "./middleware";
import { z } from "zod";

const userDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  imageUrl: z.instanceof(File).nullable(), // If imageUrl can be null, use nullable()
});
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());

app.use("/getimage", express.static(path.join(__dirname, "..", "uploads")));

app.post("/signup", upload.single("image"), async (req, res) => {
  try {
    const result = userDetailsSchema.safeParse({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      imageUrl: req.file?.path
        ? new File([req.file?.buffer], req.file?.originalname)
        : null,
    });

    if (!result.success) {
      const errors = result.error.format();
      return res.status(400).send({ message: "Validation failed", errors });
    }
    const data = req.body;
    if (req.file?.filename) {
      data.imageUrl = req.file.filename;
    }
    const otp = generateOTP(4);
    const response = await signUp(data, otp);

    if (response.email) {
      const sendmail = await sendMail(response.email, otp);
      console.log(sendmail);
    }
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: "NEW_USER",
            user: {
              email: response.email,
              phoneNumber: response.phoneNumber,
              imageUrl: response.imageUrl,
            },
          })
        );
      }
    });
    const { email, phoneNumber } = response;
    res.send({ message: "Otp has been Sent", email, phoneNumber });
  } catch (error) {
    console.log("on SignUp Something Went Wrong", error);
  }
});

app.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  const isVerified = await verifyEmail(email, otp);
  res.send(isVerified);
});

app.post("/signin", async (req, res) => {
  const data = req.body;
  const response = await signIn(data);
  console.log("signUp", response);
  if (response?.isVerified?.email?.otp == false) {
    res.send({ message: "unAuthorised" });
  } else if (response?.email) {
    const getJwt = generateToken(response.email);
    res.send({ token: getJwt, message: "Authorised" });
  }
});
app.get("/all", authenticateToken, async (req, res) => {
  const response = await getAll();
  let clientArray: any = [];
  response.map((data) => {
    const { email, phoneNumber, imageUrl } = data;
    clientArray.push({ email, phoneNumber, imageUrl });
  });
  res.send(clientArray);
});
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
