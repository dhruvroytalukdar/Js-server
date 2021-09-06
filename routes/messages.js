const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const checkAuth = require("../middlewares/checkAuth");

const prisma = new PrismaClient();

router.post("/create", checkAuth, async (req, res) => {
  const email = req.body.email;
  const content = req.body.content;
  const reciever = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  const user = await prisma.user.findUnique({
    where: {
      email: req.user.email,
    },
  });

  let rfriends = reciever.friends;
  let ufriends = user.friends;

  // add use to reciever's friend list
  if (rfriends.includes(user.email) === false) {
    try {
      await prisma.user.update({
        where: {
          email: reciever.email,
        },
        data: {
          friends: {
            push: user.email,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  // add reciever to user's friend list
  if (ufriends.includes(reciever.email) === false) {
    try {
      await prisma.user.update({
        where: {
          email: req.user.email,
        },
        data: {
          friends: {
            push: reciever.email,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  try {
    await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        recieverId: reciever.id,
      },
    });
    res.status(203).json({ message: "Message sent" });
  } catch (error) {
    res.status(404).json({ message: "Message not sent" });
  }
});

// Delete a message
router.delete("/delete", checkAuth, async (req, res) => {
  try {
    await prisma.message.delete({
      where: {
        id: req.body.id,
      },
    });
    res.status(202).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(403).json({ message: "Error occured" });
  }
});

// Get all messages between user and others
router.get("/get", checkAuth, async (req, res) => {
  let m =
    await prisma.$queryRaw`SELECT * FROM "Message" WHERE "recieverId"=${req.body.id} AND "senderId"=${req.user.id} OR "recieverId"=${req.user.id} AND "senderId"=${req.body.id} ORDER BY "sent";`;
  res.status(202).send({ message: "success", data: m });
});

module.exports = router;
