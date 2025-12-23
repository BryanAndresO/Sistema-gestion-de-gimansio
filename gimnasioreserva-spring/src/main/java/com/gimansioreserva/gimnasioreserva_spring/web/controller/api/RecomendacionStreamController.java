package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.EmitirEventoRequest;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import com.gimansioreserva.gimnasioreserva_spring.service.core.RecomendacionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux; // Importa Flux de Project Reactor para manejo de flujos reactivos.
import java.time.Duration; // Importa Duration para el heartbeat

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
     * Incluye un heartbeat cada 30 segundos para mantener la conexión activa.
     *
     * @return Un Flux de RecomendacionDTO que se enviará al cliente.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<RecomendacionDTO> streamRecomendaciones() {
        System.out.println("Nueva conexión SSE establecida");
        
        // Crear heartbeat para mantener la conexión activa
        Flux<RecomendacionDTO> heartbeat = Flux.interval(Duration.ofSeconds(30))
                .map(tick -> new RecomendacionDTO(
                        "heartbeat",
                        "Sistema",
                        "Conexión activa",
                        0,
                        java.time.LocalDateTime.now()
                ));
        
        // Se conecta al flujo de eventos del gimnasio y luego utiliza el servicio de recomendaciones
        // para transformar estos eventos en un flujo de DTOs de recomendaciones.
        Flux<RecomendacionDTO> recomendaciones = recomendacionService.generar(
                eventoGymService.flujoEventos()
        );
        
        // Combinar el flujo de recomendaciones con el heartbeat
        return Flux.merge(recomendaciones, heartbeat)
                .doOnSubscribe(subscription -> {
                    System.out.println("Cliente suscrito al stream SSE");
                })
                .doOnComplete(() -> {
                    System.out.println("Stream SSE completado");
                })
                .doOnError(error -> {
                    System.err.println("Error en stream SSE: " + error.getMessage());
                });
    }

    /**
     * Endpoint para simular la emisión de un evento del gimnasio.
     * Utilizado para pruebas y demostraciones, permitiendo enviar eventos manualmente.
     *
     * @param request Objeto EmitirEventoRequest que contiene la claseId y el tipo de evento a simular.
     */
    @PostMapping("/simular")
    public void simularEvento(@RequestBody EmitirEventoRequest request) {
        System.out.println("Endpoint /simular recibido: " + request.getClaseId() + " - " + request.getTipo());

        // Crea un objeto EventoGym a partir de los datos de la solicitud.
        EventoGym evento = new EventoGym(
                request.getClaseId(),
                request.getTipo()
        );

        System.out.println("EventoGym creado: " + evento.getClaseId() + " - " + evento.getTipo());

        // Emite el evento simulado a través del servicio de eventos.
        eventoGymService.emitirEvento(evento);
        
        System.out.println("Evento emitido a EventoGymService");
    }
}
