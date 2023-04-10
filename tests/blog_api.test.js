const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

afterAll(async () => {
  await mongoose.connection.close();
});
