const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const User = require("../models/user");
const {
  initialBlogs,
  initialUsers,
  blogsInDb,
  usersInDb,
} = require("./test_helper");

const api = supertest(app);

let authHeader;

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);

  await User.deleteMany({});

  const user = initialUsers[0];
  await api.post("/api/users").send(user);
  const response = await api.post("/api/login").send(user);
  authHeader = `Bearer ${response.body.token}`;
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

    expect(response.body).toHaveLength(initialBlogs.length);
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
      author: "test",
      url: "https://google.com/",
      likes: 3,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", authHeader)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtTheEnd = await blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(initialBlogs.length + 1);

    const contents = blogsAtTheEnd.map((b) => b.title);
    expect(contents).toContain("How to play jazz");
  });

  test("blog with bad token can't be added", async () => {
    const newBlog = {
      title: "How to play jazz",
      url: "https://google.com/",
      likes: 3,
    };

    await api.post("/api/blogs").send(newBlog).expect(401);

    const blogsAtTheEnd = await blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(initialBlogs.length);
  });

  test("likes default to 0 if missing", async () => {
    const newBlog = {
      title: "How to play jazz",
      url: "https://google.com/",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", authHeader)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtTheEnd = await blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(initialBlogs.length + 1);

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

    const blogsAtTheEnd = await blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(initialBlogs.length);
  });

  test("400 if  url is missing", async () => {
    const newBlog = {
      title: "How to play jazz",
      likes: 3,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const blogsAtTheEnd = await blogsInDb();
    expect(blogsAtTheEnd).toHaveLength(initialBlogs.length);
  });
});

describe("deletion of a blog post", () => {
  // create a post
  let id;
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blog = {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", authHeader)
      .send(blog);

    id = response.body.id;
  });

  test("can be deleted by the creator", async () => {
    const blogsBefore = await blogsInDb();

    await api
      .delete(`/api/blogs/${id}`)
      .set("Authorization", authHeader)
      .expect(204);

    const blogsAfter = await blogsInDb();

    expect(blogsAfter).toHaveLength(blogsBefore.length - 1);
  });

  test("can not be deleted without valid auth header", async () => {
    const blogsBefore = await blogsInDb();

    await api.delete(`/api/blogs/${id}`).expect(401);

    const blogsAfter = await blogsInDb();

    expect(blogsAfter).toHaveLength(blogsBefore.length);
  });
});

describe("update info of a blog post", () => {
  test("succeeds with status code 200 if id is valid", async () => {
    const blogsAtStart = await blogsInDb();
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

    const blogsAtEnd = await blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.length);

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

    const usersAtTheEnd = await usersInDb();
    expect(usersAtTheEnd).toHaveLength(initialUsers.length + 1);

    const userNames = usersAtTheEnd.map((u) => u.username);
    expect(userNames).toContain("test");
  });

  test("400 if username is missing", async () => {
    const newUser = {
      name: "test_user",
      password: "123456",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const usersAtTheEnd = await usersInDb();
    expect(usersAtTheEnd).toHaveLength(initialUsers.length);
  });

  test("400 if password is missing", async () => {
    const newUser = {
      username: "test",
      name: "test_user",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const usersAtTheEnd = await usersInDb();
    expect(usersAtTheEnd).toHaveLength(initialUsers.length);
  });

  test("400 if password is less than 3 characters", async () => {
    const newUser = {
      username: "test",
      name: "test_user",
      password: "12",
    };

    await api.post("/api/users").send(newUser).expect(400);

    const usersAtTheEnd = await usersInDb();
    expect(usersAtTheEnd).toHaveLength(initialUsers.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
