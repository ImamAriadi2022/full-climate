const { ApiError } = require("../utils/apiError");

const assertSafeIdentifier = (identifier) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new ApiError(500, "Konfigurasi nama tabel tidak valid.");
  }

  return identifier;
};

const resolveTableName = (station) => {
  // Keep fallback aligned with historical topic table names to avoid 500s
  // when station-specific env vars are not defined.
  const fallbackTopic4 = process.env.TOPIC4_TABLE || "topic4";
  const fallbackTopic5 = process.env.TOPIC5_TABLE || "topic5";

  const station1Table =
    process.env.PETENGORAN_STATION1_TABLE || process.env.TOPIC4_TABLE_PETENGORAN || fallbackTopic4;
  const station2Table =
    process.env.PETENGORAN_STATION2_TABLE || process.env.TOPIC5_TABLE_PETENGORAN || fallbackTopic5;

  const byStation = {
    station1: station1Table,
    station2: station2Table,
  };

  return assertSafeIdentifier(byStation[station]);
};

const mapPostgresError = (error, tableName) => {
  if (error && error.code === "42P01") {
    throw new ApiError(
      500,
      `Tabel '${tableName}' tidak ditemukan. Periksa konfigurasi PETENGORAN_STATION1_TABLE/PETENGORAN_STATION2_TABLE.`
    );
  }

  if (error && ["ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND", "EHOSTUNREACH"].includes(error.code)) {
    throw new ApiError(
      503,
      "Koneksi ke database gagal. Periksa DB_HOST, DB_PORT, dan akses jaringan ke server PostgreSQL."
    );
  }

  throw error;
};

const getPetengoranStationHistory = async (pool, station, pagination, defaults) => {
  if (!pool) {
    throw new ApiError(500, "Database belum dikonfigurasi untuk endpoint ini.");
  }

  const tableName = resolveTableName(station);
  const limit = pagination?.limit ?? defaults.defaultLimit;
  const offset = pagination?.offset ?? defaults.defaultOffset;

  let rows;
  try {
    const result = await pool.query(
      `SELECT * FROM ${tableName} ORDER BY timestamp DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    rows = result.rows;
  } catch (error) {
    mapPostgresError(error, tableName);
  }

  return Array.isArray(rows) ? rows : [];
};

const getPetengoranStationLatest = async (pool, station) => {
  if (!pool) {
    throw new ApiError(500, "Database belum dikonfigurasi untuk endpoint ini.");
  }

  const tableName = resolveTableName(station);

  let rows;
  try {
    const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY timestamp DESC LIMIT 1`);
    rows = result.rows;
  } catch (error) {
    mapPostgresError(error, tableName);
  }

  return Array.isArray(rows) ? rows : [];
};

module.exports = {
  getPetengoranStationHistory,
  getPetengoranStationLatest,
};
