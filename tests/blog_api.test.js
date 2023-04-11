const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");

const api = supertest(app);

let token;

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);

  await User.deleteMany({});

  const user = {
    username: "test123",
    name: "test123",
    password: "12345",
  };
  await api.post("/api/users").send(user);

  const response = await api.post("/api/login").send(user);
  token = response.body.token;
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
      url: "https://google.com/",
      likes: 3,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
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
      url: "https://google.com/",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
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
      likes: 3,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogsAtTheEnd = await helper.blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe("deletion of a blog post", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const titles = blogsAtEnd.map((b) => b.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe("update info of a blog post", () => {
  test("succeeds with status code 200 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedContent = {
      title: "Updated title",
      author: "Updated author",
      url: "updated",
      likes: 5,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedContent)
      .expect(200);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    const titles = blogsAtEnd.map((b) => b.title);
    expect(titles).toContain(updatedContent.title);
  });
});

describe("addition of a new user", () => {
  test("a valid user can be added", async () => {
    const newUser = {
      username: "test",
      name: "test_user",
      password: "123456",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtTheEnd = await helper.usersInDb();
    expect(usersAtTheEnd).toHaveLength(1);

    const userNames = usersAtTheEnd.map((u) => u.username);
    expect(userNames).toContain("test");
  });

  test("400 if username is missing", async () => {
    const newUser = {
      name: "test_user",
      password: "123456",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const usersAtTheEnd = await helper.usersInDb();
    expect(usersAtTheEnd).toHaveLength(0);
  });

  test("400 if password is missing", async () => {
    const newUser = {
      username: "test",
      name: "test_user",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const usersAtTheEnd = await helper.usersInDb();
    expect(usersAtTheEnd).toHaveLength(0);
  });

  test("400 if password is less than 3 characters", async () => {
    const newUser = {
      username: "test",
      name: "test_user",
      password: "12",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const usersAtTheEnd = await helper.usersInDb();
    expect(usersAtTheEnd).toHaveLength(0);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
