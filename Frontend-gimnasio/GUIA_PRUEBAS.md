# 🧪 Guía de Pruebas - Sistema SSE de Recomendaciones

## 📋 Pre-requisitos

1. **Java 17** instalado
2. **Node.js** y **npm** instalados
3. **MySQL** corriendo (o H2 si usas base de datos en memoria)
4. Backend y Frontend configurados

---

## 🔧 Paso 1: Configuración Inicial

### 1.1 Configurar Variables de Entorno del Frontend

Crea el archivo `.env` en `Frontend-gimnasio/`:

```env
VITE_API_URL=http://localhost:8080
```

### 1.2 Verificar Configuración del Backend

Asegúrate de que el backend esté configurado para correr en el puerto **8080** (por defecto).

---

## 🚀 Paso 2: Iniciar los Servicios

### 2.1 Iniciar el Backend (Spring Boot)

Abre una terminal y navega a la carpeta del backend:

```bash
cd Sistema-gestion-de-gimansio/gimnasioreserva-spring
```

**Opción A: Con Gradle Wrapper (Windows)**
```bash
.\gradlew.bat bootRun
```

**Opción B: Con Gradle Wrapper (Linux/Mac)**
```bash
./gradlew bootRun
```

**Opción C: Desde tu IDE**
- Ejecuta la clase `GimnasioreservaSpringApplication.java`

✅ **Verificación:** Deberías ver en la consola:
```
Started GimnasioreservaSpringApplication in X.XXX seconds
```

### 2.2 Iniciar el Frontend (Vite)

Abre **otra terminal** y navega a la carpeta del frontend:

```bash
cd Sistema-gestion-de-gimansio/Frontend-gimnasio
```

Instala dependencias (solo la primera vez):
```bash
npm install
```

Inicia el servidor de desarrollo:
```bash
npm run dev
```

✅ **Verificación:** Deberías ver:
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 Paso 3: Probar la Conexión SSE

### 3.1 Abrir la Aplicación en el Navegador

1. Abre tu navegador y ve a: `http://localhost:5173`
2. Inicia sesión o regístrate (si es necesario)
3. Navega a **Dashboard** o **Mis Reservas**

### 3.2 Verificar el Componente de Recomendaciones

Deberías ver:
- ✅ Un card con el título "Recomendaciones en Tiempo Real"
- ✅ Un indicador de estado (punto verde/gris) que dice "Conectado" o "Desconectado"
- ✅ Un mensaje que dice "No hay recomendaciones en este momento"

### 3.3 Verificar la Consola del Navegador

Abre las **DevTools** (F12) y ve a la pestaña **Console**. Deberías ver:
```
Conexión SSE abierta
Conexión SSE establecida
```

Si ves errores de CORS o conexión, verifica:
- ✅ El backend está corriendo en el puerto 8080
- ✅ La variable `VITE_API_URL` está configurada correctamente
- ✅ El endpoint `/api/recomendaciones/stream` está accesible

---

## 🎯 Paso 4: Simular Eventos (Prueba Real)

### 4.1 Usando Postman o Insomnia

**Endpoint:** `POST http://localhost:8080/api/recomendaciones/simular`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**

**Ejemplo 1: Cupo Disponible**
```json
{
  "claseId": "CLASE-001",
  "tipo": "CUPO_DISPONIBLE"
}
```

**Ejemplo 2: Clase Llena**
```json
{
  "claseId": "CLASE-002",
  "tipo": "CLASE_LLENA"
}
```

**Ejemplo 3: Cambio de Horario**
```json
{
  "claseId": "CLASE-003",
  "tipo": "CAMBIO_HORARIO"
}
```

### 4.2 Usando cURL (Terminal)

**Cupo Disponible:**
```bash
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId":"CLASE-001","tipo":"CUPO_DISPONIBLE"}'
```

**Clase Llena:**
```bash
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId":"CLASE-002","tipo":"CLASE_LLENA"}'
```

**Cambio de Horario:**
```bash
curl -X POST http://localhost:8080/api/recomendaciones/simular \
  -H "Content-Type: application/json" \
  -d '{"claseId":"CLASE-003","tipo":"CAMBIO_HORARIO"}'
```

### 4.3 Usando JavaScript en la Consola del Navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Cupo Disponible
fetch('http://localhost:8080/api/recomendaciones/simular', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    claseId: 'CLASE-001',
    tipo: 'CUPO_DISPONIBLE'
  })
});

// Clase Llena
fetch('http://localhost:8080/api/recomendaciones/simular', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    claseId: 'CLASE-002',
    tipo: 'CLASE_LLENA'
  })
});

// Cambio de Horario
fetch('http://localhost:8080/api/recomendaciones/simular', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    claseId: 'CLASE-003',
    tipo: 'CAMBIO_HORARIO'
  })
});
```

---

## ✅ Paso 5: Verificar que Funciona

### 5.1 Después de Enviar un Evento

1. **En el navegador:** Deberías ver aparecer una nueva recomendación **automáticamente** (sin refrescar)
2. **Indicador de conexión:** Debe estar en verde y decir "Conectado"
3. **Card de recomendación:** Debe mostrar:
   - ✓ Icono según el tipo de evento
   - Mensaje descriptivo (ej: "¡Cupo disponible!")
   - Clase ID
   - Hora relativa (ej: "hace un momento")

### 5.2 Probar Múltiples Eventos

Envía varios eventos diferentes y verifica:
- ✅ Cada recomendación aparece en tiempo real
- ✅ No hay duplicados (si envías el mismo `claseId` dos veces, solo aparece una vez)
- ✅ Los colores cambian según el tipo:
  - 🟢 Verde para `CUPO_DISPONIBLE`
  - 🔴 Rojo para `CLASE_LLENA`
  - 🟡 Amarillo para `CAMBIO_HORARIO`

### 5.3 Probar Múltiples Pestañas

1. Abre el Dashboard en **dos pestañas diferentes**
2. Envía un evento desde Postman/cURL
3. ✅ **Ambas pestañas** deben recibir el evento simultáneamente

---

## 🔍 Paso 6: Verificación de Errores

### 6.1 Probar Desconexión

1. Detén el backend (Ctrl+C en la terminal)
2. ✅ El indicador debe cambiar a gris y decir "Desconectado"
3. ✅ Debe aparecer un mensaje de error

### 6.2 Probar Reconexión

1. Reinicia el backend
2. ✅ El indicador debe volver a verde automáticamente
3. ✅ La conexión SSE se restablece

### 6.3 Verificar Prevención de Duplicados

Envía el mismo evento dos veces con el mismo `claseId`:
```json
{"claseId": "CLASE-001", "tipo": "CUPO_DISPONIBLE"}
```

✅ Solo debe aparecer **una vez** en la lista

---

## 🐛 Troubleshooting

### Problema: "No se conecta"

**Solución:**
1. Verifica que el backend esté corriendo: `http://localhost:8080/api/recomendaciones/stream`
2. Verifica el archivo `.env`: `VITE_API_URL=http://localhost:8080`
3. Revisa la consola del navegador para ver errores específicos

### Problema: "Error CORS"

**Solución:**
1. Verifica que el backend tenga configurado CORS para `http://localhost:5173`
2. Revisa `CorsConfig.java` en el backend

### Problema: "No aparecen recomendaciones"

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica que no haya errores de conexión
3. Verifica que el endpoint `/api/recomendaciones/simular` esté funcionando
4. Revisa la pestaña **Network** en DevTools para ver las peticiones SSE

### Problema: "Eventos duplicados"

**Solución:**
- El hook ya previene duplicados por `claseId`
- Si persisten, verifica que cada evento tenga un `claseId` único

---

## 📊 Checklist de Pruebas

- [ ] Backend inicia correctamente en puerto 8080
- [ ] Frontend inicia correctamente en puerto 5173
- [ ] Componente `RecomendacionesLive` se muestra en Dashboard
- [ ] Componente `RecomendacionesLive` se muestra en Mis Reservas
- [ ] Indicador de conexión muestra "Conectado" (verde)
- [ ] Evento `CUPO_DISPONIBLE` aparece correctamente
- [ ] Evento `CLASE_LLENA` aparece correctamente
- [ ] Evento `CAMBIO_HORARIO` aparece correctamente
- [ ] No hay duplicados cuando se envía el mismo `claseId`
- [ ] Múltiples pestañas reciben eventos simultáneamente
- [ ] La conexión se restablece automáticamente después de un error
- [ ] Los colores y mensajes son correctos según el tipo de evento

---

## 🎉 ¡Listo!

Si todos los pasos funcionan correctamente, tu implementación SSE está completa y funcionando. Las recomendaciones aparecerán en tiempo real sin necesidad de refrescar la página.

