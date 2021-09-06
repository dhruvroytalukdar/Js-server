const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const checkAuth = require("../middlewares/checkAuth");

const prisma = new PrismaClient();

// Query all users
router.get("/", checkAuth, async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});

// Search user's friends
router.get("/friends", checkAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.user.email,
    },
  });
  let friends = [];
  for (let index in user.friends) {
    let email = user.friends[index];
    const x = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (x) friends.push(x);
  }
  res.status(200).json(friends);
});

// Search a user
router.get("/find", checkAuth, async (req, res) => {
  const { email } = req.body;
  try {
    const data = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send({ message: "Bad Request" });
  }
});

//Current Logged in user
router.get("/me", checkAuth, (req, res) => {
  res.status(202).json(req.user);
});

module.exports = router;
