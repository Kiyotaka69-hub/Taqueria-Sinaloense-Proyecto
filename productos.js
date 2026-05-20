// routes/productos.js
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('cat', sql.Int, req.query.categoria || null)
      .query(`SELECT p.*, c.nombre AS categoria_nombre
              FROM Productos p
              INNER JOIN Categorias c ON p.id_categoria = c.id_categoria
              WHERE (@cat IS NULL OR p.id_categoria = @cat)
              ORDER BY c.nombre, p.nombre`);
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.get('/disponibles', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request().query(
      `SELECT p.*, c.nombre AS categoria_nombre
       FROM Productos p INNER JOIN Categorias c ON p.id_categoria=c.id_categoria
       WHERE p.estatus='disponible' ORDER BY c.nombre, p.nombre`
    );
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT p.*, c.nombre AS categoria_nombre
              FROM Productos p INNER JOIN Categorias c ON p.id_categoria=c.id_categoria
              WHERE p.id_producto=@id`);
    if (!r.recordset.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(r.recordset[0]);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_categoria, nombre, descripcion, precio_actual, costo_preparacion, estatus = 'disponible' } = req.body;
    const pool = await getPool();
    const r = await pool.request()
      .input('id_categoria',      sql.Int,           id_categoria)
      .input('nombre',            sql.VarChar(120),  nombre)
      .input('descripcion',       sql.VarChar(500),  descripcion)
      .input('precio_actual',     sql.Decimal(10,2), precio_actual)
      .input('costo_preparacion', sql.Decimal(10,2), costo_preparacion)
      .input('estatus',           sql.VarChar(15),   estatus)
      .query(`INSERT INTO Productos (id_categoria,nombre,descripcion,precio_actual,costo_preparacion,estatus)
              OUTPUT INSERTED.id_producto
              VALUES (@id_categoria,@nombre,@descripcion,@precio_actual,@costo_preparacion,@estatus)`);
    res.status(201).json({ id_producto: r.recordset[0].id_producto });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id_categoria, nombre, descripcion, precio_actual, costo_preparacion, estatus } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id',                sql.Int,           req.params.id)
      .input('id_categoria',      sql.Int,           id_categoria)
      .input('nombre',            sql.VarChar(120),  nombre)
      .input('descripcion',       sql.VarChar(500),  descripcion)
      .input('precio_actual',     sql.Decimal(10,2), precio_actual)
      .input('costo_preparacion', sql.Decimal(10,2), costo_preparacion)
      .input('estatus',           sql.VarChar(15),   estatus)
      .query(`UPDATE Productos SET id_categoria=@id_categoria, nombre=@nombre, descripcion=@descripcion,
              precio_actual=@precio_actual, costo_preparacion=@costo_preparacion, estatus=@estatus
              WHERE id_producto=@id`);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query("UPDATE Productos SET estatus='no disponible' WHERE id_producto=@id");
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
