const jwt = require("jsonwebtoken");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  const wholeToken = req.headers["authorization"];
  const token = wholeToken && wholeToken.split(" ")[1];

  if (!token) res.status(403).json({ message: "Access Denied" });
  else {
    jwt.verify(token, process.env.AUTH_TOKEN_SECRET, async (error, data) => {
      if (error) res.status(403).json({ Message: "Invalid Token" });
      else {
        let validToken = await prisma.token.findUnique({
          where: {
            token,
          },
        });
        if (!validToken) res.status(403).json({ message: "token expired" });
        else {
          req.user = data;
          next();
        }
      }
    });
  }
};
