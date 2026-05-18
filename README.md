# TacoSoft — Sistema de Punto de Venta
### Cadena de Taquerías "El Sinaloense"
**Materia:** Base de Datos | Alumnos: Miguel Vergara, Pedro Manriquez, Victor Ochoa

---

## Estructura del proyecto

```
tacosoft/
├── backend/
│   ├── db/
│   │   └── connection.js      
│   ├── routes/
│   │   ├── sucursales.js
│   │   ├── categorias.js
│   │   ├── productos.js
│   │   ├── empleados.js
│   │   ├── clientes.js
│   │   ├── promociones.js
│   │   ├── pedidos.js          
│   │   └── reportes.js         
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── tacosoft.css            
│   ├── api.js                   
│   ├── catalogos.html          
│   ├── pos.html                
│   ├── pedidos.html             
│   └── dashboard.html           
└── sql/
    ├── tacosoft_schema.sql     
    ├── tacosoft_seed.sql        
    └── tacosoft_procedures.sql  
