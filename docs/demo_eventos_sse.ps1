# ============================================================
#  DEMO - Programación Reactiva con Mono/Flux y SSE
#  Sistema de Gestión de Gimnasio
# ============================================================
#
#  El frontend mostrará las recomendaciones en TIEMPO REAL
#  gracias al flujo reactivo: Sinks → Flux → SSE → EventSource
# ============================================================

$BASE_URL = "https://sistema-gestion-de-gimansio.onrender.com/api/recomendaciones/simular"

# Colores para la consola
function Write-Header($text) {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor White
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Event($tipo, $claseId, $color) {
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    Write-Host "  [$timestamp] " -ForegroundColor DarkGray -NoNewline
    Write-Host "EVENTO >> " -ForegroundColor $color -NoNewline
    Write-Host "$tipo" -ForegroundColor $color -NoNewline
    Write-Host " (claseId: $claseId)" -ForegroundColor Gray
}

function Write-FluxInfo($text) {
    Write-Host "           " -NoNewline
    Write-Host "Flux: " -ForegroundColor DarkYellow -NoNewline
    Write-Host "$text" -ForegroundColor DarkGray
}

function Send-Evento($claseId, $tipo, $color) {
    $body = @{
        claseId = $claseId
        tipo    = $tipo
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri $BASE_URL -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Event $tipo $claseId $color
    }
    catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ============================
# INICIO DE LA DEMO
# ============================
Clear-Host
Write-Header "DEMO: Programación Reactiva - Mono/Flux + SSE"

Write-Host "  Este script simula eventos del gimnasio que fluyen a traves" -ForegroundColor Gray
Write-Host "  del pipeline reactivo de Project Reactor:" -ForegroundColor Gray
Write-Host ""
Write-Host "  Sinks.Many" -ForegroundColor Yellow -NoNewline
Write-Host " --> " -ForegroundColor DarkGray -NoNewline
Write-Host "Flux<EventoGym>" -ForegroundColor Green -NoNewline
Write-Host " --> " -ForegroundColor DarkGray -NoNewline
Write-Host "filter/flatMap" -ForegroundColor Magenta -NoNewline
Write-Host " --> " -ForegroundColor DarkGray -NoNewline
Write-Host "Flux<RecomendacionDTO>" -ForegroundColor Cyan -NoNewline
Write-Host " --> " -ForegroundColor DarkGray -NoNewline
Write-Host "SSE" -ForegroundColor White
Write-Host ""
Write-Host "  Asegurate de tener el frontend abierto para ver los eventos!" -ForegroundColor Yellow
Write-Host ""

# Countdown
for ($i = 5; $i -ge 1; $i--) {
    Write-Host "`r  Iniciando en $i segundos... " -ForegroundColor DarkGray -NoNewline
    Start-Sleep -Seconds 1
}
Write-Host "`r  Iniciando!                     " -ForegroundColor Green

# ---- FASE 1: Eventos individuales ----
Write-Header "FASE 1: Eventos Individuales (Sinks.tryEmitNext)"

Write-Host "  Cada evento pasa por el pipeline reactivo:" -ForegroundColor DarkGray
Write-Host "  EventoGymService.emitirEvento() -> publisher.tryEmitNext()" -ForegroundColor DarkGray
Write-Host ""

Start-Sleep -Seconds 1

Write-Host "  [1/5] Simulando: Un cupo se libero en Yoga..." -ForegroundColor White
Send-Evento "1" "CUPO_DISPONIBLE" "Green"
Write-FluxInfo "filter() -> flatMap(Mono.fromCallable(claseRepo.findById)) -> onNext"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  [2/5] Simulando: CrossFit esta lleno..." -ForegroundColor White
Send-Evento "2" "CLASE_LLENA" "Red"
Write-FluxInfo "filter() -> flatMap(buscar 'CrossFit Intenso') -> onBackpressureLatest()"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  [3/5] Simulando: Cambio de horario en Spinning..." -ForegroundColor White
Send-Evento "3" "CAMBIO_HORARIO" "Yellow"
Write-FluxInfo "filter() -> flatMap(buscar 'Spinning Nocturno') -> distinct(claseId)"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  [4/5] Simulando: Nueva reserva en Yoga..." -ForegroundColor White
Send-Evento "1" "RESERVA_CREADA" "Cyan"
Write-FluxInfo "filter() -> flatMap(Mono.just(RecomendacionDTO)) -> mergeWith(heartbeat)"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "  [5/5] Simulando: Reserva cancelada en CrossFit..." -ForegroundColor White
Send-Evento "2" "RESERVA_CANCELADA" "Magenta"
Write-FluxInfo "filter() -> flatMap() -> Schedulers.boundedElastic() -> onNext"
Start-Sleep -Seconds 2

# ---- FASE 2: Ráfaga de eventos ----
Write-Header "FASE 2: Rafaga de Eventos (Backpressure Demo)"

Write-Host "  Enviando multiples eventos seguidos para demostrar" -ForegroundColor DarkGray
Write-Host "  onBackpressureLatest() del Flux reactivo." -ForegroundColor DarkGray
Write-Host ""

Start-Sleep -Seconds 2

$rafaga = @(
    @{ claseId = "1"; tipo = "CUPO_DISPONIBLE"; color = "Green" },
    @{ claseId = "2"; tipo = "CAMBIO_HORARIO"; color = "Yellow" },
    @{ claseId = "3"; tipo = "CLASE_LLENA"; color = "Red" },
    @{ claseId = "4"; tipo = "CUPO_DISPONIBLE"; color = "Green" },
    @{ claseId = "5"; tipo = "RESERVA_CREADA"; color = "Cyan" }
)

foreach ($ev in $rafaga) {
    Send-Evento $ev.claseId $ev.tipo $ev.color
    Start-Sleep -Milliseconds 500
}

Write-FluxInfo "onBackpressureLatest() maneja la rafaga sin bloquear el subscriber"

# ---- FASE 3: Simulación continua ----
Write-Header "FASE 3: Simulacion Continua (Stream en Tiempo Real)"

Write-Host "  Simulando actividad real del gimnasio durante 30 segundos..." -ForegroundColor DarkGray
Write-Host "  Observa como los eventos aparecen en el frontend en TIEMPO REAL." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 2

$tipos = @(
    @{ tipo = "CUPO_DISPONIBLE"; color = "Green" },
    @{ tipo = "CLASE_LLENA"; color = "Red" },
    @{ tipo = "CAMBIO_HORARIO"; color = "Yellow" },
    @{ tipo = "RESERVA_CREADA"; color = "Cyan" },
    @{ tipo = "RESERVA_CANCELADA"; color = "Magenta" }
)

for ($i = 1; $i -le 10; $i++) {
    $claseId = Get-Random -Minimum 1 -Maximum 6
    $eventoRandom = $tipos | Get-Random
    
    Write-Host "  [$i/10] " -ForegroundColor DarkGray -NoNewline
    Send-Evento "$claseId" $eventoRandom.tipo $eventoRandom.color
    
    $pausa = Get-Random -Minimum 2 -Maximum 5
    Start-Sleep -Seconds $pausa
}

# ---- FIN ----
Write-Header "DEMO COMPLETADA"

Write-Host "  Flujo reactivo demostrado exitosamente:" -ForegroundColor Green
Write-Host ""
Write-Host "  1. Sinks.Many (Publisher multicast)" -ForegroundColor White
Write-Host "     -> tryEmitNext() emite eventos al flujo" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Flux<EventoGym> (Flujo de eventos)" -ForegroundColor White
Write-Host "     -> filter(), flatMap(), distinct(), onBackpressureLatest()" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Mono.fromCallable() (Operaciones bloqueantes)" -ForegroundColor White
Write-Host "     -> Schedulers.boundedElastic() separa BD del flujo reactivo" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Flux<RecomendacionDTO> + SSE (Server-Sent Events)" -ForegroundColor White
Write-Host "     -> mergeWith(heartbeat) mantiene la conexion viva" -ForegroundColor Gray
Write-Host ""
Write-Host "  Total de eventos enviados: 20" -ForegroundColor Cyan
Write-Host ""
