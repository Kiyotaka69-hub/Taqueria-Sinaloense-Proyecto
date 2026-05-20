// ============================================================
//  routes/sucursales.js
// ============================================================
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

// GET /api/sucursales
router.get('/', async (_req, res, next) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(
      'SELECT id_sucursal, nombre, direccion, ciudad, telefono, estatus FROM Sucursales ORDER BY nombre'
    );
    res.json(result.recordset);
  } catch (e) { next(e); }
});

// GET /api/sucursales/:id
router.get('/:id', async (req, res, next) => {
  try {
    const pool   = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Sucursales WHERE id_sucursal = @id');
    if (!result.recordset.length) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(result.recordset[0]);
  } catch (e) { next(e); }
});

// POST /api/sucursales
router.post('/', async (req, res, next) => {
  try {
    const { nombre, direccion, ciudad, telefono, estatus = 'activa' } = req.body;
    const pool   = await getPool();
    const result = await pool.request()
      .input('nombre',    sql.VarChar(100), nombre)
      .input('direccion', sql.VarChar(200), direccion)
      .input('ciudad',    sql.VarChar(80),  ciudad)
      .input('telefono',  sql.VarChar(20),  telefono)
      .input('estatus',   sql.VarChar(10),  estatus)
      .query(`INSERT INTO Sucursales (nombre,direccion,ciudad,telefono,estatus)
              OUTPUT INSERTED.id_sucursal
              VALUES (@nombre,@direccion,@ciudad,@telefono,@estatus)`);
    res.status(201).json({ id_sucursal: result.recordset[0].id_sucursal });
  } catch (e) { next(e); }
});

// PUT /api/sucursales/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, direccion, ciudad, telefono, estatus } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id',        sql.Int,          req.params.id)
      .input('nombre',    sql.VarChar(100), nombre)
      .input('direccion', sql.VarChar(200), direccion)
      .input('ciudad',    sql.VarChar(80),  ciudad)
      .input('telefono',  sql.VarChar(20),  telefono)
      .input('estatus',   sql.VarChar(10),  estatus)
      .query(`UPDATE Sucursales SET nombre=@nombre, direccion=@direccion, ciudad=@ciudad,
              telefono=@telefono, estatus=@estatus WHERE id_sucursal=@id`);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// DELETE logico /api/sucursales/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query("UPDATE Sucursales SET estatus='cerrada' WHERE id_sucursal=@id");
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
