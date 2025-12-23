package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.EmitirEventoRequest;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import com.gimansioreserva.gimnasioreserva_spring.service.core.RecomendacionService;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux; // Importa Flux de Project Reactor para manejo de flujos reactivos.
import reactor.core.publisher.Mono; // Importa Mono para operaciones reactivas
import java.time.Duration; // Importa Duration para el heartbeat
import java.util.Optional;

@RestController
@RequestMapping("/api/recomendaciones") // Define el prefijo de la URL para este controlador.
public class RecomendacionStreamController {

    private final EventoGymService eventoGymService; // Servicio para la gestión de eventos del gimnasio.
    private final RecomendacionService recomendacionService; // Servicio para generar recomendaciones a partir de eventos.

    // Constructor que inyecta las dependencias de los servicios.
    public RecomendacionStreamController(EventoGymService eventoGymService,
                                         RecomendacionService recomendacionService) {
        this.eventoGymService = eventoGymService;
        this.recomendacionService = recomendacionService;
    }

    /**
     * Endpoint SSE (Server-Sent Events) para transmitir recomendaciones en tiempo real.
     * Este método produce un stream de eventos de texto (`MediaType.TEXT_EVENT_STREAM_VALUE`).
     * Incluye un heartbeat cada 15 segundos para mantener la conexión activa.
     * Soporta autenticación vía query parameter para EventSource compatibility.
     *
     * @param request Objeto ServerHttpRequest para extraer el token
     * @return Un Flux de RecomendacionDTO que se enviará al cliente.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<RecomendacionDTO> streamRecomendaciones(ServerHttpRequest request) {
        // Extraer token del query parameter
        String token = Optional.ofNullable(request.getQueryParams().getFirst("token"))
                .orElse(null);
        
        System.out.println("Nueva conexión SSE establecida" + (token != null ? " con token" : " sin token"));
        
        // Stream infinito que nunca se completa - ESTA ES LA SOLUCIÓN CLAVE
        return Flux.never()
                .mergeWith(
                    // Heartbeat cada 10 segundos para mantener conexión activa
                    Flux.interval(Duration.ofSeconds(10))
                            .map(tick -> new RecomendacionDTO(
                                    "heartbeat",
                                    "Sistema",
                                    "Conexión activa",
                                    0,
                                    java.time.LocalDateTime.now()
                            ))
                )
                .mergeWith(
                    // Stream de recomendaciones que se combina con el stream infinito
                    recomendacionService.generar(eventoGymService.flujoEventos())
                            .doOnNext(rec -> System.out.println("Recomendación emitida: " + rec.getClaseId()))
                )
                .doOnSubscribe(subscription -> {
                    System.out.println("Cliente suscrito al stream SSE INFINITO");
                })
                .doOnCancel(() -> {
                    System.out.println("Cliente canceló la suscripción SSE");
                })
                .doOnError(error -> {
                    System.err.println("Error en stream SSE: " + error.getMessage());
                    // NO completar el stream, solo loggear el error
                })
                .log("sse-stream"); // Log para debugging
    }

    /**
     * Endpoint para simular la emisión de un evento del gimnasio.
     * Utilizado para pruebas y demostraciones, permitiendo enviar eventos manualmente.
     *
     * @param request Objeto EmitirEventoRequest que contiene la claseId y el tipo de evento a simular.
     */
    @PostMapping("/simular")
    public void simularEvento(@RequestBody EmitirEventoRequest request) {

        // Crea un objeto EventoGym a partir de los datos de la solicitud.
        EventoGym evento = new EventoGym(
                request.getClaseId(),
                request.getTipo()
        );

        // Emite el evento simulado a través del servicio de eventos.
        eventoGymService.emitirEvento(evento);
    }
}
