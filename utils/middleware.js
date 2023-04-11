const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  if (error.name === "JsonWebTokenError") {
    return response.status(400).json({ error: error.message });
  }
  if (error.name === "TokenExpiredError") {
    return response.status(401).json({
      error: "token expired",
    });
  }

  return next(error);
};

module.exports = { unknownEndpoint, errorHandler };
