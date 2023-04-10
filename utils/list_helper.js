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

const mostBlogs = (blogs) => {
  // Create map (author: num blogs)
  const authorBlogs = new Map();

  blogs.forEach((blog) => {
    const { author } = blog;
    const { likes } = blog;

    if (authorBlogs.has(author)) {
      const updatedLikes = authorBlogs.get(author) + likes;
      authorBlogs.set(author, updatedLikes);
    } else {
      authorBlogs.set(author, likes);
    }
  });

  // reduce() to get the author with most blogs
  return [...authorBlogs.entries()].reduce((prev, current) =>
    prev.likes > current.likes ? prev : current
  );
};

// const mostLikes = (blogs) => {};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  // mostLikes,
};
