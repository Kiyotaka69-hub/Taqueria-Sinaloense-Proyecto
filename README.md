# 🌮 TacoSoft — Sistema de Punto de Venta
### Cadena de Taquerías "El Sinaloense"
**Materia:** Base de Datos | **Periodo:** 2026

---

## Estructura del proyecto

```
tacosoft/
├── backend/
│   ├── db/
│   │   └── connection.js        # Conexión a SQL Server con mssql
│   ├── routes/
│   │   ├── sucursales.js
│   │   ├── categorias.js
│   │   ├── productos.js
│   │   ├── empleados.js
│   │   ├── clientes.js
│   │   ├── promociones.js
│   │   ├── pedidos.js           # POS + Gestión (via stored procedures)
│   │   └── reportes.js          # Dashboard (via stored procedures)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── tacosoft.css             # Estilos globales
│   ├── api.js                   # Capa de comunicación frontend → backend
│   ├── catalogos.html           # Módulo 1: CRUD de catálogos
│   ├── pos.html                 # Módulo 2: Punto de venta
│   ├── pedidos.html             # Módulo 3: Gestión de pedidos
│   └── dashboard.html           # Módulo 4: Dashboard de reportes
└── sql/
    ├── tacosoft_schema.sql      # CREATE DATABASE + tablas + trigger
    ├── tacosoft_seed.sql        # Datos de prueba (seed)
    └── tacosoft_procedures.sql  # 17 stored procedures
```

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| SQL Server | 2019 o superior |
| SQL Server Management Studio (SSMS) | Cualquier versión reciente |
| Node.js | 18 o superior |
| npm | Incluido con Node.js |
| Navegador web | Chrome, Edge o Firefox |

---

## Paso 1 — Configurar la base de datos en SQL Server

Abre **SSMS** y ejecuta los scripts en este orden:

```
1. tacosoft_schema.sql       ← Crea la BD, tablas, constraints y trigger
2. tacosoft_seed.sql         ← Inserta los datos de prueba
3. tacosoft_procedures.sql   ← Crea los 17 stored procedures
```

> ⚠️ **Importante:** ejecutar en ese orden. Si ejecutas el seed antes del schema obtendrás errores.

---

## Paso 2 — Configurar el backend

### 2.1 Instalar dependencias

Abre una terminal en la carpeta `backend/`:

```bash
cd backend
npm install
```

Esto instala: `express`, `mssql`, `cors`, `dotenv`, `nodemon`.

### 2.2 Crear el archivo .env

Copia el archivo de ejemplo y edítalo con tus datos:

```bash
# En Windows:
copy .env.example .env

# En Mac/Linux:
cp .env.example .env
```

Edita `.env` con tus credenciales de SQL Server:

```env
DB_SERVER=localhost        # o la IP de tu servidor SQL
DB_PORT=1433
DB_NAME=TacoSoft
DB_USER=sa                 # tu usuario SQL
DB_PASSWORD=TuPassword     # tu contraseña
DB_ENCRYPT=false           # true si usas Azure SQL
PORT=3000
```

> 💡 Si usas **autenticación de Windows** en lugar de SQL Server, instala adicionalmente `msnodesqlv8` y ajusta la conexión en `db/connection.js`.

### 2.3 Arrancar el servidor

```bash
# Modo desarrollo (se reinicia automáticamente):
npm run dev

# Modo producción:
npm start
```

Deberías ver:
```
[TacoSoft] Servidor en http://localhost:3000
[DB] Conectado a SQL Server - TacoSoft
```

### 2.4 Verificar que funciona

Abre en el navegador: `http://localhost:3000/api/health`

Respuesta esperada:
```json
{ "ok": true, "sistema": "TacoSoft", "version": "1.0.0" }
```

---

## Paso 3 — Abrir el frontend

El frontend es HTML puro, **no necesita servidor ni build**.

Abre directamente los archivos en tu navegador:

| Archivo | Módulo |
|---|---|
| `catalogos.html` | Módulo 1 — Catálogos CRUD |
| `pos.html` | Módulo 2 — Punto de Venta |
| `pedidos.html` | Módulo 3 — Gestión de Pedidos |
| `dashboard.html` | Módulo 4 — Dashboard de Reportes |

> 💡 **Recomendación:** usa la extensión **Live Server** de VS Code para abrirlos con un clic derecho → "Open with Live Server". Así evitas problemas de CORS al hacer fetch.

---

## Flujo de uso del sistema

### Módulo 2 — Punto de Venta (flujo completo)
1. Selecciona **sucursal** y **cajero activo**
2. Elige **tipo de pedido** (en local / para llevar / a domicilio)
3. Clic en **"Iniciar pedido"** → se crea el registro en BD
4. Opcionalmente busca o registra un **cliente frecuente**
5. Navega por **categorías** y agrega productos al ticket
6. Si hay promoción vigente, **aplícala**
7. **Confirma** el pedido → pasa a "preparando" en cocina

### Módulo 3 — Gestión de Pedidos (flujo de cocina)
- Filtra por estatus y sucursal
- **▶ Avanzar:** pendiente → preparando → listo → entregado
- **🚫 Cancelar:** solo desde pendiente o preparando
- **🔍 Ver:** detalle completo del pedido
- Se refresca automáticamente cada 30 segundos

### Módulo 4 — Dashboard
1. Selecciona rango de fechas y opcionalmente una sucursal
2. Clic en **"Generar reportes"**
3. Aparecen 4 gráficas + 2 tablas con todos los indicadores

---

## Endpoints del backend (referencia rápida)

### Catálogos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/sucursales` | Listar sucursales |
| POST | `/api/sucursales` | Crear sucursal |
| PUT | `/api/sucursales/:id` | Editar sucursal |
| DELETE | `/api/sucursales/:id` | Baja lógica |
| GET | `/api/productos/disponibles` | Menú para el POS |

### Pedidos (POS)
| Método | Ruta | SP invocado |
|---|---|---|
| POST | `/api/pedidos` | `sp_NuevoPedido` |
| POST | `/api/pedidos/:id/productos` | `sp_AgregarProductoAlPedido` |
| POST | `/api/pedidos/:id/promocion` | `sp_AplicarPromocion` |
| PUT | `/api/pedidos/:id/confirmar` | `sp_ConfirmarPedido` |
| PUT | `/api/pedidos/:id/avanzar` | `sp_AvanzarEstatusPedido` |
| PUT | `/api/pedidos/:id/cancelar` | `sp_CancelarPedido` |

### Reportes
| Método | Ruta | SP invocado |
|---|---|---|
| GET | `/api/reportes/ventas-sucursal` | `sp_ReporteVentasPorSucursal` |
| GET | `/api/reportes/productos-mas-vendidos` | `sp_ReporteProductosMasVendidos` |
| GET | `/api/reportes/ventas-categoria` | `sp_ReporteVentasPorCategoria` |
| GET | `/api/reportes/rendimiento-empleados` | `sp_ReporteRendimientoEmpleados` |
| GET | `/api/reportes/comparativo-mensual` | `sp_ReporteComparativoMensual` |
| GET | `/api/reportes/sin-movimiento` | `sp_ReporteProductosSinMovimiento` |

---

## Stored Procedures incluidos (17)

| SP | Descripción |
|---|---|
| `sp_NuevoPedido` | Crea encabezado del pedido con validaciones |
| `sp_AgregarProductoAlPedido` | Agrega línea al detalle (copia precio actual) |
| `sp_AplicarPromocion` | Aplica descuento a productos del pedido |
| `sp_ConfirmarPedido` | Cambia de pendiente → preparando |
| `sp_AvanzarEstatusPedido` | Flujo lineal de estatus |
| `sp_CancelarPedido` | Solo desde pendiente o preparando |
| `sp_CancelarPedidosVencidos` | Auto-cancela pedidos > 24 hrs en pendiente |
| `sp_BuscarCliente` | Búsqueda por nombre o teléfono |
| `sp_RegistrarCliente` | Alta de cliente frecuente |
| `sp_ObtenerDetallePedido` | Detalle completo (2 resultsets) |
| `sp_ListarPedidosPorEstatus` | Lista filtrada por sucursal y estatus |
| `sp_ReporteVentasPorSucursal` | GROUP BY + JOIN |
| `sp_ReporteProductosMasVendidos` | TOP 10 + ORDER BY |
| `sp_ReporteVentasPorCategoria` | GROUP BY categoría |
| `sp_ReporteRendimientoEmpleados` | GROUP BY + HAVING > 5 |
| `sp_ReporteComparativoMensual` | GROUP BY MONTH/YEAR |
| `sp_ReporteProductosSinMovimiento` | NOT EXISTS |

---

## Reglas de negocio implementadas

| # | Regla | Dónde |
|---|---|---|
| 1 | Exactamente un gerente activo por sucursal | Trigger `TR_UnGerente_PorSucursal` |
| 2 | Pedido cancelado no se puede reactivar | `sp_CancelarPedido` + `sp_AvanzarEstatusPedido` |
| 3 | Precio en detalle = precio al momento de la venta | `sp_AgregarProductoAlPedido` |
| 4 | Promociones aplican solo a productos específicos | `sp_AplicarPromocion` + tabla `PromocionProductos` |
| 5 | Empleado inactivo no puede tomar pedidos | `sp_NuevoPedido` |
| 6 | Nunca se elimina físicamente | DELETE lógico en todos los endpoints |
| 7 | TRY/CATCH + TRANSACTION en todos los SPs | Todos los stored procedures |
| 8 | Queries parametrizados (sin SQL injection) | Todos los routes con `.input()` de mssql |

---

## Datos de prueba incluidos

| Tabla | Cantidad |
|---|---|
| Sucursales | 4 (Culiacán, Mazatlán, Los Mochis, Guasave) |
| Categorías | 5 (Tacos, Burritos, Bebidas, Postres, Extras) |
| Productos | 20 distribuidos en 5 categorías |
| Empleados | 12 (al menos 3 por sucursal, 1 gerente cada una) |
| Clientes | 10 con datos de Sinaloa |
| Promociones | 3 (1 vigente, 1 futura, 1 expirada) |
| Pedidos | 30 distribuidos en varias fechas y sucursales |
| Detalle | 70+ líneas |