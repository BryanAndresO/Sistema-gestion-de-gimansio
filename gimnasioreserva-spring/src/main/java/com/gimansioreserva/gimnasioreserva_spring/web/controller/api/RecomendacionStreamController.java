package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.EmitirEventoRequest;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import com.gimansioreserva.gimnasioreserva_spring.service.core.RecomendacionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/recomendaciones")
public class RecomendacionStreamController {

    private final EventoGymService eventoGymService;
    private final RecomendacionService recomendacionService;

    public RecomendacionStreamController(EventoGymService eventoGymService,
                                         RecomendacionService recomendacionService) {
        this.eventoGymService = eventoGymService;
        this.recomendacionService = recomendacionService;
    }

    //SSE
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<RecomendacionDTO> streamRecomendaciones() {
        return recomendacionService.generar(
                eventoGymService.flujoEventos()
        );
    }

    //Simulación para Postman
    @PostMapping("/simular")
    public void simularEvento(@RequestBody EmitirEventoRequest request) {

        EventoGym evento = new EventoGym(
                request.getClaseId(),
                request.getTipo()
        );

        eventoGymService.emitirEvento(evento);
    }
}
