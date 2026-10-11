export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    message,
    ...(err.errors ? { errors: err.errors } : {}),
  });
}

export function notFound(req, res) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}
