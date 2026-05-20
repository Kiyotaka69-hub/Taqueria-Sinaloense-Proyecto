// routes/reportes.js
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

// GET /api/reportes/ventas-sucursal?desde=2026-01-01&hasta=2026-05-31&sucursal=1
router.get('/ventas-sucursal', async (req, res, next) => {
  try {
    const { desde, hasta, sucursal } = req.query;
    const pool = await getPool();
    const r = await pool.request()
      .input('fecha_inicio', sql.Date, desde)
      .input('fecha_fin',    sql.Date, hasta)
      .input('id_sucursal',  sql.Int,  sucursal || null)
      .execute('sp_ReporteVentasPorSucursal');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// GET /api/reportes/productos-mas-vendidos?desde=...&hasta=...&sucursal=
router.get('/productos-mas-vendidos', async (req, res, next) => {
  try {
    const { desde, hasta, sucursal } = req.query;
    const pool = await getPool();
    const r = await pool.request()
      .input('fecha_inicio', sql.Date, desde)
      .input('fecha_fin',    sql.Date, hasta)
      .input('id_sucursal',  sql.Int,  sucursal || null)
      .execute('sp_ReporteProductosMasVendidos');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// GET /api/reportes/ventas-categoria?desde=...&hasta=...&sucursal=
router.get('/ventas-categoria', async (req, res, next) => {
  try {
    const { desde, hasta, sucursal } = req.query;
    const pool = await getPool();
    const r = await pool.request()
      .input('fecha_inicio', sql.Date, desde)
      .input('fecha_fin',    sql.Date, hasta)
      .input('id_sucursal',  sql.Int,  sucursal || null)
      .execute('sp_ReporteVentasPorCategoria');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// GET /api/reportes/rendimiento-empleados?desde=...&hasta=...&sucursal=
router.get('/rendimiento-empleados', async (req, res, next) => {
  try {
    const { desde, hasta, sucursal } = req.query;
    const pool = await getPool();
    const r = await pool.request()
      .input('fecha_inicio', sql.Date, desde)
      .input('fecha_fin',    sql.Date, hasta)
      .input('id_sucursal',  sql.Int,  sucursal || null)
      .execute('sp_ReporteRendimientoEmpleados');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// GET /api/reportes/comparativo-mensual?anio=2026&sucursal=
router.get('/comparativo-mensual', async (req, res, next) => {
  try {
    const { anio, sucursal } = req.query;
    const pool = await getPool();
    const r = await pool.request()
      .input('anio',        sql.Int, parseInt(anio) || new Date().getFullYear())
      .input('id_sucursal', sql.Int, sucursal || null)
      .execute('sp_ReporteComparativoMensual');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// GET /api/reportes/sin-movimiento?desde=...&hasta=...&sucursal=
router.get('/sin-movimiento', async (req, res, next) => {
  try {
    const { desde, hasta, sucursal } = req.query;
    const pool = await getPool();
    const r = await pool.request()
      .input('fecha_inicio', sql.Date, desde)
      .input('fecha_fin',    sql.Date, hasta)
      .input('id_sucursal',  sql.Int,  sucursal || null)
      .execute('sp_ReporteProductosSinMovimiento');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

module.exports = router;
