# Zénit Salón — sitio y tienda

Next.js 16, con el diseño original y nuevas herramientas de agenda y pedidos.
Para aplicar la actualización: `LEER_PRIMERO_ZENIT.txt`.

```bash
npm ci
npm run lint
npm run build
npm start
```

Configurar `ZENIT_API_URL` en el servidor con la URL HTTPS del backend Zenit.
Los navegadores llaman a `/api/backend/api/...`; esta ruta fija el destino y
mantiene los JWT en cookies HttpOnly. No publicar claves de integración ni
contraseñas como variables NEXT_PUBLIC_*.

- `/admin`: acceso personal de la propietaria, agenda, horarios y pedidos,
  además de clientes, puntos y catálogo existentes.
- `/reservar`: servicios y cupos disponibles para clientes registrados.
- `/mi-cuenta`: citas y pedidos propios, cancelaciones y contraseña.
- `/tienda`: carrito, pedido persistente y coordinación de pago por WhatsApp.

Necesita el backend de esta entrega, sus migraciones y la configuración inicial
de horarios y duración de servicios. Funciona en Vercel/Node; no es una
exportación estática. No activa el POS general ni implementa cuentas por cobrar.
