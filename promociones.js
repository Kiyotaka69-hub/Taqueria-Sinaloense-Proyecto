// routes/promociones.js
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

router.get('/', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request().query(
      `SELECT p.*,
         (SELECT STRING_AGG(CAST(pp.id_producto AS VARCHAR), ',')
          FROM PromocionProductos pp WHERE pp.id_promocion=p.id_promocion) AS productos_ids,
         CASE
           WHEN CAST(GETDATE() AS DATE) BETWEEN p.fecha_inicio AND p.fecha_fin THEN 'vigente'
           WHEN CAST(GETDATE() AS DATE) < p.fecha_inicio THEN 'futura'
           ELSE 'expirada'
         END AS estado_vigencia
       FROM Promociones p ORDER BY p.fecha_inicio DESC`
    );
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.get('/vigentes', async (_req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request().query(
      `SELECT p.*, pp.id_producto
       FROM Promociones p
       INNER JOIN PromocionProductos pp ON p.id_promocion=pp.id_promocion
       WHERE CAST(GETDATE() AS DATE) BETWEEN p.fecha_inicio AND p.fecha_fin`
    );
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT p.*, pr.id_producto, prod.nombre AS producto_nombre
              FROM Promociones p
              LEFT JOIN PromocionProductos pr ON p.id_promocion=pr.id_promocion
              LEFT JOIN Productos prod ON pr.id_producto=prod.id_producto
              WHERE p.id_promocion=@id`);
    if (!r.recordset.length) return res.status(404).json({ error: 'Promocion no encontrada' });
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin, productos = [] } = req.body;
    const pool = await getPool();
    const rp = await pool.request()
      .input('nombre',               sql.VarChar(120),  nombre)
      .input('descripcion',          sql.VarChar(500),  descripcion)
      .input('porcentaje_descuento', sql.Decimal(5,2),  porcentaje_descuento)
      .input('fecha_inicio',         sql.Date,          fecha_inicio)
      .input('fecha_fin',            sql.Date,          fecha_fin)
      .query(`INSERT INTO Promociones (nombre,descripcion,porcentaje_descuento,fecha_inicio,fecha_fin)
              OUTPUT INSERTED.id_promocion
              VALUES (@nombre,@descripcion,@porcentaje_descuento,@fecha_inicio,@fecha_fin)`);
    const id = rp.recordset[0].id_promocion;
    for (const id_producto of productos) {
      await pool.request()
        .input('id_promocion', sql.Int, id)
        .input('id_producto',  sql.Int, id_producto)
        .query('INSERT INTO PromocionProductos VALUES (@id_promocion,@id_producto)');
    }
    res.status(201).json({ id_promocion: id });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin, productos = [] } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id',                   sql.Int,           req.params.id)
      .input('nombre',               sql.VarChar(120),  nombre)
      .input('descripcion',          sql.VarChar(500),  descripcion)
      .input('porcentaje_descuento', sql.Decimal(5,2),  porcentaje_descuento)
      .input('fecha_inicio',         sql.Date,          fecha_inicio)
      .input('fecha_fin',            sql.Date,          fecha_fin)
      .query(`UPDATE Promociones SET nombre=@nombre,descripcion=@descripcion,
              porcentaje_descuento=@porcentaje_descuento,fecha_inicio=@fecha_inicio,fecha_fin=@fecha_fin
              WHERE id_promocion=@id`);
    await pool.request().input('id', sql.Int, req.params.id)
      .query('DELETE FROM PromocionProductos WHERE id_promocion=@id');
    for (const id_producto of productos) {
      await pool.request()
        .input('id_promocion', sql.Int, req.params.id)
        .input('id_producto',  sql.Int, id_producto)
        .query('INSERT INTO PromocionProductos VALUES (@id_promocion,@id_producto)');
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
