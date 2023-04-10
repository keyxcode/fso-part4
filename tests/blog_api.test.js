const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
}, 100000);

describe("when there are initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test("blogs are returned with id prop", async () => {
    const response = await api.get("/api/blogs");

    response.body.forEach((blog) => expect(blog.id).toBeDefined());
  });
});

describe("addition of a new blog", () => {
  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "How to play jazz",
      author: "Cadence Phan",
      url: "https://google.com/",
      likes: 3,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtTheEnd = await helper.blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length + 1);

    const contents = blogsAtTheEnd.map((b) => b.title);
    expect(contents).toContain("How to play jazz");
  });

  test("likes default to 0 if missing", async () => {
    const newBlog = {
      title: "How to play jazz",
      author: "Cadence Phan",
      url: "https://google.com/",
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtTheEnd = await helper.blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length + 1);

    const newBlogFromDb = blogsAtTheEnd.find(
      (b) => b.title === "How to play jazz"
    );
    expect(newBlogFromDb.likes).toBe(0);
  });

  test("400 if title is missing", async () => {
    const newBlog = {
      author: "Cadence Phan",
      url: "https://google.com/",
      likes: 3,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogsAtTheEnd = await helper.blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length);
  });

  test("400 if  url is missing", async () => {
    const newBlog = {
      title: "How to play jazz",
      author: "Cadence Phan",
      likes: 3,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogsAtTheEnd = await helper.blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
