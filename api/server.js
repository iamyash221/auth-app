import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";

const secret = "secret123";

// await mongoose.connect(uri:'mongodb://localhost:27017/auth', options: {useNewUrlParser: true, useUnifiedTopology: true});

await mongoose
  .connect("mongodb://127.0.0.1:27017/auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const db = mongoose.connection;

db.on("error", console.log);

const app = express();
const port = 4000;

app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/user", (req, res) => {
  const payload = jwt.verify(req.cookies.token, secret);

  User.findById(payload.id).then((userInfo) => {
    res.json({ id: userInfo._id, email: userInfo.email });
  });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ password: hashedPassword, email });
  user.save().then((userInfo) => {
    jwt.sign(
      { id: userInfo._id, email: userInfo.email },
      secret,
      (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res
            .cookie("token", token)
            .json({ id: userInfo._id, email: userInfo.email });
        }
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((userInfo) => {
    if (!userInfo) {
      return res.sendStatus(401);
    }

    const passOk = bcrypt.compareSync(password, userInfo.password);

    if (passOk) {
      jwt.sign({ id: userInfo._id, email }, secret, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res
            .cookie("token", token)
            .json({ id: userInfo._id, email: userInfo.email });
        }
      });
    } else {
      res.sendStatus(401);
    }
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
