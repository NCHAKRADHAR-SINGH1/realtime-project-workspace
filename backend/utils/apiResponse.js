const success = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

const error = (res, message, statusCode = 400, errors = null) => {
  const payload = { success: false, message };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};

module.exports = { success, error };
