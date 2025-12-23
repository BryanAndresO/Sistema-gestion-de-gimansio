package com.gimansioreserva.gimnasioreserva_spring.service.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux; // Importa Flux para flujos de datos reactivos.
import reactor.core.publisher.Mono; // Importa Mono para datos reactivos de 0 o 1 elemento.

@Service // Indica que esta clase es un componente de servicio de Spring.
public class RecomendacionService {

    private final ClaseRepository claseRepository; // Repositorio para acceder a la información de las clases.

    // Constructor que inyecta el ClaseRepository.
    public RecomendacionService(ClaseRepository claseRepository) {
        this.claseRepository = claseRepository;
    }

    /**
     * Genera un flujo de recomendaciones a partir de un flujo de eventos del gimnasio.
     * Este método implementa la lógica principal del "motor de recomendaciones" utilizando el paradigma reactivo.
     *
     * @param eventos Un Flux de EventoGym que representa los eventos en tiempo real.
     * @return Un Flux de RecomendacionDTO que contiene las recomendaciones procesadas.
     */
    public Flux<RecomendacionDTO> generar(Flux<EventoGym> eventos) {
        return eventos
                // 1. Filter: Filtra los eventos, procesando solo aquellos tipos relevantes para generar recomendaciones.
                .filter(evento ->
                        evento.getTipo() == TipoEvento.CUPO_DISPONIBLE ||
                                evento.getTipo() == TipoEvento.CLASE_LLENA ||
                                evento.getTipo() == TipoEvento.CAMBIO_HORARIO ||
                                evento.getTipo() == TipoEvento.RESERVA_CREADA ||
                                evento.getTipo() == TipoEvento.RESERVA_CANCELADA
                )
                // 2. flatMap: Transforma cada evento filtrado en una RecomendacionDTO.
                //    Se utiliza flatMap para realizar una operación asíncrona (buscar la clase por ID)
                //    y aplanar los Mono resultantes en un único Flux.
                .flatMap(evento -> {
                    try {
                        // Intenta parsear claseId a Long y buscar la clase.
                        return Mono.justOrEmpty(claseRepository.findById(Long.parseLong(evento.getClaseId())))
                                .map(clase -> new RecomendacionDTO(
                                        evento.getClaseId(),
                                        clase.getNombre(),
                                        generarMensaje(evento, clase.getNombre()),
                                        generarPrioridad(evento.getTipo()),
                                        evento.getTimestamp()
                                ));
                    } catch (NumberFormatException e) {
                        // Si claseId no es un número válido, registra el error y devuelve un Mono.empty()
                        // para que este evento sea ignorado y no rompa el stream.
                        System.err.println("ERROR: claseId inválido para parseo Long en EventoGym: " +
                                evento.getClaseId() + ". Mensaje: " + e.getMessage());
                        return Mono.empty();
                    }
                })
                // 3. distinct: Asegura que solo se emita una recomendación por claseId, evitando duplicados en un corto periodo.
                .distinct(RecomendacionDTO::getClaseId)
                // 4. onBackpressureLatest: Estrategia de contrapresión que mantiene solo la última señal
                //    si el suscriptor no puede procesar los eventos tan rápido como se emiten.
                .onBackpressureLatest()
                // doOnError: Captura cualquier error en el pipeline de recomendaciones
                .doOnError(e -> System.err.println("ERROR en RecomendacionService pipeline: " + e.getMessage()));
    }

    /**
     * Genera un mensaje descriptivo para la recomendación basado en el tipo de evento y el nombre de la clase.
     *
     * @param evento El EventoGym que disparó la recomendación.
     * @param nombreClase El nombre de la clase asociada al evento.
     * @return El mensaje de la recomendación.
     */
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

    /**
     * Asigna una prioridad numérica a la recomendación basada en el tipo de evento.
     *
     * @param tipo El TipoEvento del evento del gimnasio.
     * @return Un entero que representa la prioridad.
     */
    private Integer generarPrioridad(TipoEvento tipo) {
        return switch (tipo) {
            case CUPO_DISPONIBLE -> 1; // Alta prioridad
            case CAMBIO_HORARIO -> 2; // Media prioridad
            case CLASE_LLENA -> 3; // Baja prioridad
            default -> 4; // Prioridad por defecto
        };
    }
}
