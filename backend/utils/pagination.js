const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;
  return { limit: parsedLimit, offset };
};

const getPagingData = (data, page = 1, limit = 10) => {
  const { count: total, rows: items } = data;
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const totalPages = Math.ceil(total / parsedLimit);

  return {
    items,
    pagination: {
      total,
      totalPages,
      currentPage: parsedPage,
      limit: parsedLimit,
    },
  };
};

module.exports = { getPagination, getPagingData };
