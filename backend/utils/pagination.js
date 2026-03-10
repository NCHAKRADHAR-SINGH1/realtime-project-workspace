const getPagination = (page, limit) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;
  return { limit: parsedLimit, offset };
};

const getPagingData = (data, page, limit) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const { count: total, rows } = data;
  const totalPages = Math.ceil(total / parsedLimit);

  return {
    data: rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
    },
  };
};

module.exports = { getPagination, getPagingData };
