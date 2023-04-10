const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const { body } = request;

  if (!body.title || !body.url) return response.status(400).end();
  if (!body.likes) body.likes = 0;

  const blog = new Blog(body);

  const result = await blog.save();
  return response.status(201).json(result);
});

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);

  return response.status(204).end();
});

module.exports = blogsRouter;
