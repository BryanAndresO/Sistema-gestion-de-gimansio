# Script para probar el sistema de recomendaciones en tiempo real

## Pasos para probar el sistema:

### 1. Iniciar el Backend
```bash
cd gimnasioreserva-spring
./gradlew bootRun
```

### 2. Iniciar el Frontend  
```bash
cd Frontend-gimnasio
npm run dev
```

### 3. Probar el Stream SSE
Abre el navegador en `http://localhost:5173` y ve a la sección de recomendaciones.

### 4. Simular Eventos (Opción A - Postman/curl)
Usa estos comandos para simular eventos:

```bash
# Simular cupo disponible
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId": "1", "tipo": "CUPO_DISPONIBLE"}'

# Simular clase llena
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId": "2", "tipo": "CLASE_LLENA"}'

# Simular cambio de horario
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId": "YOGA-101", "tipo": "CAMBIO_HORARIO"}'

# Simular reserva creada
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId": "3", "tipo": "RESERVA_CREADA"}'

# Simular reserva cancelada
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId": "4", "tipo": "RESERVA_CANCELADA"}'
```

### 5. Simular Eventos (Opción B - Swagger UI)
Abre `http://localhost:8080/swagger-ui.html` y busca el endpoint:
- POST `/api/recomendaciones/simular`

### 6. Verificar en la Consola
- **Backend**: Deberías ver logs de eventos emitidos y heartbeats cada 30 segundos
- **Frontend**: Abre las herramientas de desarrollador y revisa la consola para ver:
  - "Conexión SSE establecida"
  - "Heartbeat recibido" (cada 30 segundos)
  - "Recomendación recibida" (cuando simulas eventos)

### 7. Probar Desconexión/Reconexión
- Desconecta y reconecta tu internet
- Cierra y abre el navegador
- Verifica que la conexión se restablece automáticamente

## Qué esperar ver:

### En el Frontend:
- Indicador verde "Conectado" cuando la SSE está activa
- Heartbeats invisibles cada 30 segundos (solo en consola)
- Recomendaciones que aparecen en tiempo real cuando simulas eventos
- Colores diferentes según prioridad (verde=alta, amarillo=media, roja=baja)

### En el Backend:
- Logs de "Nueva conexión SSE establecida"
- Logs de "Heartbeat enviado" cada 30 segundos
- Logs de eventos procesados

## Posibles Issues y Soluciones:

### Si no se conecta:
1. Verifica que el backend esté corriendo en el puerto 8080
2. Revisa la configuración CORS en `application.properties`
3. Abre las herramientas de desarrollador para ver errores de red

### Si los heartbeats no llegan:
1. Revisa la consola del backend para ver si se están enviando
2. Verifica que no haya firewalls bloqueando las conexiones SSE

### Si las recomendaciones no aparecen:
1. Asegúrate de que las clases existan en la BD (para IDs numéricos)
2. Prueba con IDs no numéricos como "YOGA-101" para generar nombres genéricos
