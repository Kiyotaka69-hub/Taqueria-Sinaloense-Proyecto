// routes/clientes.js
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

// GET /api/clientes?busqueda=...  (busca por nombre o telefono via SP)
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    if (req.query.busqueda) {
      const r = await pool.request()
        .input('busqueda', sql.VarChar(150), req.query.busqueda)
        .execute('sp_BuscarCliente');
      return res.json(r.recordset);
    }
    const r = await pool.request()
      .query('SELECT * FROM Clientes ORDER BY nombre');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Clientes WHERE id_cliente=@id');
    if (!r.recordset.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(r.recordset[0]);
  } catch (e) { next(e); }
});

// POST /api/clientes  (usa sp_RegistrarCliente)
router.post('/', async (req, res, next) => {
  try {
    const { nombre, telefono, correo, ciudad } = req.body;
    const pool = await getPool();
    const r = await pool.request()
      .input('nombre',   sql.VarChar(150), nombre)
      .input('telefono', sql.VarChar(20),  telefono || null)
      .input('correo',   sql.VarChar(150), correo   || null)
      .input('ciudad',   sql.VarChar(80),  ciudad   || null)
      .output('id_cliente_out', sql.Int)
      .execute('sp_RegistrarCliente');
    res.status(201).json({ id_cliente: r.output.id_cliente_out });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, telefono, correo, ciudad } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id',       sql.Int,          req.params.id)
      .input('nombre',   sql.VarChar(150), nombre)
      .input('telefono', sql.VarChar(20),  telefono)
      .input('correo',   sql.VarChar(150), correo)
      .input('ciudad',   sql.VarChar(80),  ciudad)
      .query('UPDATE Clientes SET nombre=@nombre,telefono=@telefono,correo=@correo,ciudad=@ciudad WHERE id_cliente=@id');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
