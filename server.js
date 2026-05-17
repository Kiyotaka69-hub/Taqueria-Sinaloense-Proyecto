require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/sucursales',  require('./routes/sucursales'));
app.use('/api/categorias',  require('./routes/categorias'));
app.use('/api/productos',   require('./routes/productos'));
app.use('/api/empleados',   require('./routes/empleados'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/promociones', require('./routes/promociones'));
app.use('/api/pedidos',     require('./routes/pedidos'));
app.use('/api/reportes',    require('./routes/reportes'));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, sistema: 'TacoSoft', version: '1.0.0' }));

// Manejo global de errores
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const codigo  = err.number || err.code || 500;
  const mensaje = err.originalError?.info?.message || err.message || 'Error interno del servidor';
  res.status(typeof codigo === 'number' && codigo >= 50001 ? 400 : 500).json({ error: mensaje });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[TacoSoft] Servidor en http://localhost:${PORT}`));