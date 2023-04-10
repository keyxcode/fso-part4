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
  if (blogs.length === 0) return undefined;

  const authorBlogs = new Map();

  blogs.forEach((blog) => {
    const { author } = blog;

    if (authorBlogs.has(author)) {
      const updatedBlogs = authorBlogs.get(author) + 1;
      authorBlogs.set(author, updatedBlogs);
    } else {
      authorBlogs.set(author, 1);
    }
  });

  const authorMostBlogs = [...authorBlogs.entries()].reduce((prev, current) =>
    prev[1] > current[1] ? prev : current
  );

  return {
    author: authorMostBlogs[0],
    blogs: authorMostBlogs[1],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return undefined;

  const authorLikes = new Map();

  blogs.forEach((blog) => {
    const { author } = blog;
    const { likes } = blog;

    if (authorLikes.has(author)) {
      const updatedLikes = authorLikes.get(author) + likes;
      authorLikes.set(author, updatedLikes);
    } else {
      authorLikes.set(author, likes);
    }
  });

  const authorMostLikes = [...authorLikes.entries()].reduce((prev, current) =>
    prev[1] > current[1] ? prev : current
  );

  return {
    author: authorMostLikes[0],
    likes: authorMostLikes[1],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
