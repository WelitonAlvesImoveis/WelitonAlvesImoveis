export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const message =
    isProduction && statusCode === 500
      ? "Erro interno do servidor"
      : err.message;

  const body = { error: message };

  if (!isProduction) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};
