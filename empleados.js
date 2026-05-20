// routes/empleados.js
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('suc', sql.Int, req.query.sucursal || null)
      .query(`SELECT e.*, s.nombre AS sucursal_nombre
              FROM Empleados e INNER JOIN Sucursales s ON e.id_sucursal=s.id_sucursal
              WHERE (@suc IS NULL OR e.id_sucursal=@suc)
              ORDER BY s.nombre, e.nombre_completo`);
    res.json(r.recordset);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT e.*, s.nombre AS sucursal_nombre
              FROM Empleados e INNER JOIN Sucursales s ON e.id_sucursal=s.id_sucursal
              WHERE e.id_empleado=@id`);
    if (!r.recordset.length) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(r.recordset[0]);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_sucursal, nombre_completo, telefono, puesto, salario_quincenal, fecha_ingreso, estatus = 'activo' } = req.body;
    const pool = await getPool();
    const r = await pool.request()
      .input('id_sucursal',       sql.Int,           id_sucursal)
      .input('nombre_completo',   sql.VarChar(150),  nombre_completo)
      .input('telefono',          sql.VarChar(20),   telefono)
      .input('puesto',            sql.VarChar(30),   puesto)
      .input('salario_quincenal', sql.Decimal(10,2), salario_quincenal)
      .input('fecha_ingreso',     sql.Date,          fecha_ingreso)
      .input('estatus',           sql.VarChar(10),   estatus)
      .query(`INSERT INTO Empleados (id_sucursal,nombre_completo,telefono,puesto,salario_quincenal,fecha_ingreso,estatus)
              OUTPUT INSERTED.id_empleado
              VALUES (@id_sucursal,@nombre_completo,@telefono,@puesto,@salario_quincenal,@fecha_ingreso,@estatus)`);
    res.status(201).json({ id_empleado: r.recordset[0].id_empleado });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id_sucursal, nombre_completo, telefono, puesto, salario_quincenal, fecha_ingreso, estatus } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id',                sql.Int,           req.params.id)
      .input('id_sucursal',       sql.Int,           id_sucursal)
      .input('nombre_completo',   sql.VarChar(150),  nombre_completo)
      .input('telefono',          sql.VarChar(20),   telefono)
      .input('puesto',            sql.VarChar(30),   puesto)
      .input('salario_quincenal', sql.Decimal(10,2), salario_quincenal)
      .input('fecha_ingreso',     sql.Date,          fecha_ingreso)
      .input('estatus',           sql.VarChar(10),   estatus)
      .query(`UPDATE Empleados SET id_sucursal=@id_sucursal, nombre_completo=@nombre_completo,
              telefono=@telefono, puesto=@puesto, salario_quincenal=@salario_quincenal,
              fecha_ingreso=@fecha_ingreso, estatus=@estatus WHERE id_empleado=@id`);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query("UPDATE Empleados SET estatus='inactivo' WHERE id_empleado=@id");
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
