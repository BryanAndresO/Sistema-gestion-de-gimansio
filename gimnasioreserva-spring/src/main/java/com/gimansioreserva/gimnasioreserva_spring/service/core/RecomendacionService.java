package com.gimansioreserva.gimnasioreserva_spring.service.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;
import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux; // Importa Flux para flujos de datos reactivos.
import reactor.core.publisher.Mono; // Importa Mono para datos reactivos de 0 o 1 elemento.
import reactor.core.scheduler.Schedulers;

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
                //    Envuelve operaciones bloqueantes de BD en un thread pool dedicado para mantener el flujo reactivo.
                .flatMap(evento -> {
                    try {
                        // Intenta parsear claseId a Long y buscar la clase
                        Long idClase = Long.parseLong(evento.getClaseId());
                        
                        // Envolver la llamada bloqueante a BD en un Mono.fromCallable
                        // y ejecutarla en un thread pool separado para no bloquear el flujo reactivo
                        return Mono.fromCallable(() -> claseRepository.findById(idClase))
                                .subscribeOn(Schedulers.boundedElastic()) // Thread pool para operaciones bloqueantes
                                .flatMap(optionalClase -> {
                                    if (optionalClase.isPresent()) {
                                        Clase clase = optionalClase.get();
                                        return Mono.just(new RecomendacionDTO(
                                                evento.getClaseId(),
                                                clase.getNombre(),
                                                generarMensaje(evento, clase.getNombre()),
                                                generarPrioridad(evento.getTipo()),
                                                evento.getTimestamp()
                                        ));
                                    } else {
                                        System.out.println("Clase no encontrada en BD: " + idClase);
                                        return Mono.empty(); // No emitir nada si la clase no existe
                                    }
                                })
                                .doOnError(e -> System.err.println("Error buscando clase " + idClase + ": " + e.getMessage()))
                                .onErrorResume(e -> Mono.empty()); // Continuar el flujo si hay error
                    } catch (NumberFormatException e) {
                        // Si claseId no es un número válido, crear recomendación genérica
                        System.out.println("claseId no numérico, creando recomendación genérica: " + evento.getClaseId());
                        String nombreAmigable = generarNombreAmigable(evento.getClaseId());
                        return Mono.just(new RecomendacionDTO(
                                evento.getClaseId(),
                                nombreAmigable,
                                generarMensaje(evento, nombreAmigable),
                                generarPrioridad(evento.getTipo()),
                                evento.getTimestamp()
                        ));
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
        return switch (evento.getTipo()) {
            case CUPO_DISPONIBLE -> String.format("¡Cupo disponible en %s! Reserva ahora antes de que se ocupe.", nombreClase);
            case CLASE_LLENA -> String.format("Clase %s está llena. Prueba otra clase o espera un cupo.", nombreClase);
            case CAMBIO_HORARIO -> String.format("Cambio de horario en %s. Verifica tu agenda para no perdértela.", nombreClase);
            case RESERVA_CREADA -> String.format("Reserva confirmada para %s. ¡Te esperamos!", nombreClase);
            case RESERVA_CANCELADA -> String.format("Se liberó un cupo en %s. ¡Aprovecha la oportunidad!", nombreClase);
        };
    }

    /**
     * Genera un nombre amigable para la clase a partir del claseId.
     *
     * @param claseId El identificador de la clase.
     * @return Un nombre legible para la clase.
     */
    private String generarNombreAmigable(String claseId) {
        if (claseId == null) return "Clase Desconocida";
        
        // Convertir códigos como "YOGA-101" a "Yoga"
        if (claseId.contains("-")) {
            String[] partes = claseId.split("-");
            if (partes.length > 0) {
                String tipo = partes[0];
                return switch (tipo.toUpperCase()) {
                    case "YOGA" -> "Yoga";
                    case "PILATES" -> "Pilates";
                    case "SPINNING" -> "Spinning";
                    case "BOX" -> "Boxeo";
                    case "ZUMBA" -> "Zumba";
                    case "CROSSFIT" -> "CrossFit";
                    case "HIIT" -> "HIIT";
                    case "KICKBOXING" -> "Kickboxing";
                    case "AEROBIC" -> "Aeróbicos";
                    case "DANCE" -> "Danza";
                    case "MEDITATION" -> "Meditación";
                    case "STRETCHING" -> "Estiramientos";
                    case "FUNCTIONAL" -> "Entrenamiento Funcional";
                    case "CALISTHENICS" -> "Calistenia";
                    case "WELLNESS" -> "Wellness";
                    default -> tipo.substring(0, 1).toUpperCase() + tipo.substring(1).toLowerCase();
                };
            }
        }
        
        // Si es numérico, buscar en base de datos o usar genérico
        try {
            Long.parseLong(claseId);
            return "Clase " + claseId;
        } catch (NumberFormatException e) {
            return claseId.substring(0, 1).toUpperCase() + claseId.substring(1).toLowerCase();
        }
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
