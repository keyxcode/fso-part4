require("dotenv").config();

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.MONGODB_URI
    : process.env.TEST.MONGODB_URI;
const { PORT } = process.env;

module.exports = { MONGODB_URI, PORT };
