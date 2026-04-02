const { getPoolBySource } = require("../config/database");
const { env } = require("../config/env");
const {
  getPetengoranStationHistory,
  getPetengoranStationLatest,
} = require("../services/petengoranStationService");

const createPetengoranStationHandler = (station, mode = "history") => {
  return async (req, res, next) => {
    try {
      const pool = getPoolBySource("petengoran");
      const rows =
        mode === "latest"
          ? await getPetengoranStationLatest(pool, station)
          : await getPetengoranStationHistory(pool, station, req.pagination, {
              defaultLimit: env.topic4.defaultLimit,
              defaultOffset: env.topic4.defaultOffset,
            });

      res.status(200).json({ result: rows });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  createPetengoranStationHandler,
};
