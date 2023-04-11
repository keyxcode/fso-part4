/* eslint-disable no-underscore-dangle */

const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user");
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const { title, url, likes } = request.body;
  if (!title || !url) return response.status(400).end();

  const { user } = request;

  const blog = new Blog({
    title,
    author: user.username,
    url,
    likes: likes || 0,
    user: user.id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  return response.status(201).json(savedBlog);
});

blogsRouter.put("/:id", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const updatedContent = {
    title,
    author,
    url,
    likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    updatedContent,
    { new: true, runValidators: true, context: "query" }
  );

  response.json(updatedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const { user } = request;
  const blog = await Blog.findById(request.params.id);

  if (user.id.toString() !== blog.user.toString()) {
    return response
      .status(401)
      .json({ error: "current user is not blog author" });
  }

  await Blog.findByIdAndRemove(request.params.id);
  return response.status(204).end();
});

module.exports = blogsRouter;
