// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) =>
  blogs.reduce((total, current) => total + current.likes, 0);

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return undefined;

  return blogs.reduce((prev, current) =>
    prev.likes > current.likes ? prev : current
  );
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
