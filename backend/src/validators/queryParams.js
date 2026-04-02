const { env, parseNonNegativeInteger, parsePositiveInteger } = require("../config/env");
const { ApiError } = require("../utils/apiError");

const validatePaginationQuery = (req, _res, next) => {
  const limitRaw = req.query.limit;
  const offsetRaw = req.query.offset;

  const limit =
    limitRaw === undefined
      ? env.topic4.defaultLimit
      : parsePositiveInteger(limitRaw, Number.NaN);

  const offset =
    offsetRaw === undefined
      ? env.topic4.defaultOffset
      : parseNonNegativeInteger(offsetRaw, Number.NaN);

  if (!Number.isFinite(limit)) {
    next(new ApiError(400, "Query parameter 'limit' harus bilangan bulat positif."));
    return;
  }

  if (!Number.isFinite(offset)) {
    next(new ApiError(400, "Query parameter 'offset' harus bilangan bulat nol atau lebih."));
    return;
  }

  if (limit > env.topic4.maxLimit) {
    next(new ApiError(400, `Query parameter 'limit' maksimal ${env.topic4.maxLimit}.`));
    return;
  }

  req.pagination = {
    limit,
    offset,
  };

  next();
};

module.exports = {
  validatePaginationQuery,
};
