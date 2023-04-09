// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) =>
  blogs.reduce((total, current) => total + current.likes, 0);

const favoriteBlog = (blogs) =>
  blogs.reduce((prev, current) =>
    prev.likes > current.likes ? prev : current
  );

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
