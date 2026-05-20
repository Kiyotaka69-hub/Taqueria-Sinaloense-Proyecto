// ============================================================
//  routes/categorias.js
// ============================================================
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

router.get('/', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request().query('SELECT * FROM Categorias ORDER BY nombre');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Categorias WHERE id_categoria=@id');
    if (!r.recordset.length) return res.status(404).json({ error: 'Categoria no encontrada' });
    res.json(r.recordset[0]);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const pool = await getPool();
    const r = await pool.request()
      .input('nombre',      sql.VarChar(80),  nombre)
      .input('descripcion', sql.VarChar(300), descripcion)
      .query(`INSERT INTO Categorias (nombre,descripcion) OUTPUT INSERTED.id_categoria VALUES (@nombre,@descripcion)`);
    res.status(201).json({ id_categoria: r.recordset[0].id_categoria });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id',          sql.Int,          req.params.id)
      .input('nombre',      sql.VarChar(80),  nombre)
      .input('descripcion', sql.VarChar(300), descripcion)
      .query('UPDATE Categorias SET nombre=@nombre, descripcion=@descripcion WHERE id_categoria=@id');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
