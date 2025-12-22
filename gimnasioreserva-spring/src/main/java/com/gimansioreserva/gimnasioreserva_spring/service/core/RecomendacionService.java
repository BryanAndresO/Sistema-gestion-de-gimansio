package com.gimansioreserva.gimnasioreserva_spring.service.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class RecomendacionService {

    private final ClaseRepository claseRepository;

    public RecomendacionService(ClaseRepository claseRepository) {
        this.claseRepository = claseRepository;
    }

    public Flux<RecomendacionDTO> generar(Flux<EventoGym> eventos) {
        return eventos
                .filter(evento ->
                        evento.getTipo() == TipoEvento.CUPO_DISPONIBLE ||
                                evento.getTipo() == TipoEvento.CLASE_LLENA ||
                                evento.getTipo() == TipoEvento.CAMBIO_HORARIO ||
                                evento.getTipo() == TipoEvento.RESERVA_CREADA ||
                                evento.getTipo() == TipoEvento.RESERVA_CANCELADA
                )
                .flatMap(evento ->
                    claseRepository.findById(Long.parseLong(evento.getClaseId()))
                            .map(clase -> new RecomendacionDTO(
                                    evento.getClaseId(),
                                    clase.getNombre(),
                                    generarMensaje(evento, clase.getNombre()),
                                    generarPrioridad(evento.getTipo()),
                                    evento.getTimestamp()
                            ))
                            .flux() // Convertir Optional a Flux
                )
                .distinct(RecomendacionDTO::getClaseId)
                .onBackpressureLatest();
    }

    private String generarMensaje(EventoGym evento, String nombreClase) {
        String baseMensaje = switch (evento.getTipo()) {
            case CUPO_DISPONIBLE -> "¡Cupo disponible!";
            case CLASE_LLENA -> "Clase llena.";
            case CAMBIO_HORARIO -> "Cambio de horario.";
            case RESERVA_CREADA -> "Reserva creada.";
            case RESERVA_CANCELADA -> "Reserva cancelada.";
        };
        return baseMensaje + " en la clase " + nombreClase + ".";
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
