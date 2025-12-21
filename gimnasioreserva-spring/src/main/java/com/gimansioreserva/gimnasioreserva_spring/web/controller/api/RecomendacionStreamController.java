package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * Controller que actúa como Subscriber mediante SSE
 */
@RestController
@RequestMapping("/api/recomendaciones")
public class RecomendacionStreamController {

    private final EventoGymService eventoGymService;

    public RecomendacionStreamController(EventoGymService eventoGymService) {
        this.eventoGymService = eventoGymService;
    }

    /**
     * Cada cliente que se conecta es un Subscriber
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<EventoGym> streamEventos() {
        return eventoGymService.flujoEventos();
    }
}