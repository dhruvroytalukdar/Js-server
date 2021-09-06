const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const checkAuth = require("../middlewares/checkAuth");
const prisma = new PrismaClient();

//Register a user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const data = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(400).send({ message: "Invalid Request Format" });
  }
});

router.post("/login", async (req, res) => {
  // Authentication
  const { email, password } = req.body;
  let user;
  try {
    user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) res.status(404).json({ message: "Invalid Credentials" });
    else if (user.password !== password)
      res.status(403).json({
        message: "Wrong Password",
      });
    else {
      // Generate token
      const token = jwt.sign(user, process.env.AUTH_TOKEN_SECRET);
      await prisma.token.create({
        data: {
          token,
        },
      });
      res.status(202).json({ accessToken: token, user });
    }
  } catch (err) {
    res.status(400).json({ message: "Bad Request" });
  }
});

//Logout
router.delete("/logout", checkAuth, async (req, res) => {
  let token = req.headers["authorization"];
  token = token.split(" ")[1];
  await prisma.token.delete({
    where: {
      token,
    },
  });
  res.status(203).json({ message: "Logged out" });
});

module.exports = router;
