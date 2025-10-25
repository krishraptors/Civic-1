const notFound = (req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = { notFound, errorHandler };
