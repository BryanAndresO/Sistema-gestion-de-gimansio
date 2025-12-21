# Configuración SSE - Recomendaciones en Tiempo Real

## Paso F1: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `Frontend-gimnasio/` con el siguiente contenido:

```env
VITE_API_URL=http://localhost:8080
```

**Nota:** Si el backend está en un puerto diferente o en producción, ajusta la URL según corresponda.

## Archivos Implementados

### ✅ F2: Servicio SSE
- **Archivo:** `src/services/core/recomendacionService.ts`
- **Funcionalidad:** 
  - Implementa `EventSource` para conectarse al endpoint SSE
  - Maneja mensajes, errores, apertura y cierre de conexión
  - Incluye soporte para autenticación mediante query parameters (si el backend lo requiere)

### ✅ F3: Hook Personalizado
- **Archivo:** `src/hooks/useRecomendaciones.ts`
- **Funcionalidad:**
  - Maneja el estado de las recomendaciones
  - Evita duplicados por `claseId`
  - Gestiona el ciclo de vida de la conexión SSE
  - Proporciona funciones para limpiar y reconectar

### ✅ F4: Componente UI
- **Archivo:** `src/components/recomendaciones/RecomendacionesLive.tsx`
- **Funcionalidad:**
  - Muestra recomendaciones en tiempo real
  - Indicador de estado de conexión
  - Manejo de errores
  - Diseño responsive con Tailwind CSS

### ✅ F5: Integración
- **Archivos modificados:**
  - `src/pages/user/Dashboard.tsx` - Integrado en vista de usuario y admin
  - `src/pages/reservas/MisReservas.tsx` - Integrado en la página de reservas

## Estructura de Datos

El componente espera recibir eventos con la siguiente estructura:

```typescript
interface RecomendacionDTO {
  claseId: string;
  tipo: 'CUPO_DISPONIBLE' | 'CLASE_LLENA' | 'CAMBIO_HORARIO';
  timestamp: string; // ISO date string
}
```

## Endpoints del Backend

El servicio se conecta a:
- **SSE Stream:** `GET /api/recomendaciones/stream`
- **Simulación (opcional):** `POST /api/recomendaciones/simular`

## Características Implementadas

✅ Conexión SSE con EventSource  
✅ Manejo de errores y reconexión  
✅ Prevención de duplicados por `claseId`  
✅ UI en tiempo real sin refrescar  
✅ Indicador de estado de conexión  
✅ Integración en Dashboard y MisReservas  
✅ Soporte para múltiples pestañas (cada una mantiene su propia conexión)

## Notas de Autenticación

EventSource no soporta headers personalizados. Si el backend requiere autenticación:

1. **Opción 1:** Usar cookies (recomendado) - EventSource las incluye automáticamente
2. **Opción 2:** Pasar el token como query parameter (ya implementado en el código)
3. **Opción 3:** Modificar el backend para aceptar autenticación mediante cookies

El código actual intenta incluir el token como query parameter si está disponible en localStorage.

## Pruebas

Para probar la funcionalidad:

1. Asegúrate de que el backend esté corriendo en `http://localhost:8080`
2. Inicia el frontend con `npm run dev`
3. Navega a Dashboard o Mis Reservas
4. Usa el endpoint `/api/recomendaciones/simular` para generar eventos de prueba
5. Las recomendaciones deberían aparecer automáticamente sin refrescar la página

## Troubleshooting

- **No se conecta:** Verifica que `VITE_API_URL` esté configurado correctamente
- **Errores CORS:** Asegúrate de que el backend tenga configurado CORS correctamente
- **No aparecen recomendaciones:** Revisa la consola del navegador para ver errores de conexión
- **Duplicados:** El hook ya previene duplicados, pero si persisten, verifica que `claseId` sea único

