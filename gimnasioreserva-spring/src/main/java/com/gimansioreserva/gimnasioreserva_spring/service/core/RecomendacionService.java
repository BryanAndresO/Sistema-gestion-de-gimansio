package com.gimansioreserva.gimnasioreserva_spring.service.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class RecomendacionService {

    public Flux<RecomendacionDTO> generar(Flux<EventoGym> eventos) {
        return eventos
                .filter(e ->
                        e.getTipo() == TipoEvento.CUPO_DISPONIBLE ||
                                e.getTipo() == TipoEvento.CLASE_LLENA ||
                                e.getTipo() == TipoEvento.CAMBIO_HORARIO
                )
                .map(e -> new RecomendacionDTO(
                        e.getClaseId(),
                        generarMensaje(e),
                        generarPrioridad(e.getTipo()),
                        e.getTimestamp()
                ))
                .distinct(RecomendacionDTO::getClaseId)
                .onBackpressureLatest();
    }

    private String generarMensaje(EventoGym evento) {
        return switch (evento.getTipo()) {
            case CUPO_DISPONIBLE ->
                    "¡Cupo disponible en la clase " + evento.getClaseId() + "! Reserva ahora.";
            case CLASE_LLENA ->
                    "La clase " + evento.getClaseId() + " está llena. Considera otras opciones.";
            case CAMBIO_HORARIO ->
                    "Cambio de horario en la clase " + evento.getClaseId() + ". Revisa el nuevo horario.";
            default ->
                    "Evento informativo de la clase " + evento.getClaseId();
        };
    }

    private Integer generarPrioridad(TipoEvento tipo) {
        return switch (tipo) {
            case CUPO_DISPONIBLE -> 1;
            case CAMBIO_HORARIO -> 2;
            case CLASE_LLENA -> 3;
            default -> 4;
        };
    }
}
