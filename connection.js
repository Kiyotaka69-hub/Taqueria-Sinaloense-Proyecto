const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=TacoSoft;Trusted_Connection=yes;',
  driver: 'msnodesqlv8',
  options: {
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('[DB] Conectado a SQL Server - TacoSoft');
  }
  return pool;
}

module.exports = { getPool, sql };