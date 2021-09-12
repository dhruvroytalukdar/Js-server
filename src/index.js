require("dotenv").config();
const express = require("express");
const userRouter = require("../routes/users");
const mssgRouter = require("../routes/messages");
const authRouter = require("../routes/auth");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/messages", mssgRouter);
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
