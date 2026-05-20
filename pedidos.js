// routes/pedidos.js  — todo via stored procedures
const router = require('express').Router();
const { getPool, sql } = require('../db/connection');

// GET /api/pedidos?sucursal=1&estatus=pendiente
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('id_sucursal', sql.Int,         req.query.sucursal || null)
      .input('estatus',     sql.VarChar(15), req.query.estatus  || null)
      .execute('sp_ListarPedidosPorEstatus');
    res.json(r.recordset);
  } catch (e) { next(e); }
});

// GET /api/pedidos/:id  (detalle completo)
router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('id_pedido', sql.Int, req.params.id)
      .execute('sp_ObtenerDetallePedido');
    if (!r.recordsets[0].length) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ encabezado: r.recordsets[0][0], detalle: r.recordsets[1] });
  } catch (e) { next(e); }
});

// POST /api/pedidos  — crea encabezado (sp_NuevoPedido)
router.post('/', async (req, res, next) => {
  try {
    const { id_sucursal, id_empleado, id_cliente, tipo_pedido } = req.body;
    const pool = await getPool();
    const r = await pool.request()
      .input('id_sucursal',   sql.Int,         id_sucursal)
      .input('id_empleado',   sql.Int,         id_empleado)
      .input('id_cliente',    sql.Int,         id_cliente || null)
      .input('tipo_pedido',   sql.VarChar(15), tipo_pedido)
      .output('id_pedido_out', sql.Int)
      .execute('sp_NuevoPedido');
    res.status(201).json({ id_pedido: r.output.id_pedido_out });
  } catch (e) { next(e); }
});

// POST /api/pedidos/:id/productos  — agrega producto (sp_AgregarProductoAlPedido)
router.post('/:id/productos', async (req, res, next) => {
  try {
    const { id_producto, cantidad } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id_pedido',   sql.Int, req.params.id)
      .input('id_producto', sql.Int, id_producto)
      .input('cantidad',    sql.Int, cantidad)
      .execute('sp_AgregarProductoAlPedido');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// POST /api/pedidos/:id/promocion  — aplica promo (sp_AplicarPromocion)
router.post('/:id/promocion', async (req, res, next) => {
  try {
    const { id_promocion } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('id_pedido',    sql.Int, req.params.id)
      .input('id_promocion', sql.Int, id_promocion)
      .execute('sp_AplicarPromocion');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// PUT /api/pedidos/:id/confirmar  — pendiente -> preparando
router.put('/:id/confirmar', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id_pedido', sql.Int, req.params.id)
      .execute('sp_ConfirmarPedido');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// PUT /api/pedidos/:id/avanzar  — preparando->listo->entregado
router.put('/:id/avanzar', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id_pedido', sql.Int, req.params.id)
      .execute('sp_AvanzarEstatusPedido');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// PUT /api/pedidos/:id/cancelar
router.put('/:id/cancelar', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id_pedido', sql.Int, req.params.id)
      .input('motivo',    sql.VarChar(300), req.body.motivo || null)
      .execute('sp_CancelarPedido');
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
