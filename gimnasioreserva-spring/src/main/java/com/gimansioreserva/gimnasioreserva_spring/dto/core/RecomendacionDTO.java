package com.gimansioreserva.gimnasioreserva_spring.dto.core;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime; // Importa LocalDateTime para manejar la fecha y hora de la recomendación.

/**
 * Data Transfer Object (DTO) que representa una recomendación enviada desde el backend al frontend.
 * Utiliza @JsonInclude(JsonInclude.Include.NON_NULL) para excluir campos nulos durante la serialización JSON.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecomendacionDTO {
    private final String claseId; // ID de la clase a la que se refiere la recomendación.
    private final String nombreClase; // Nombre de la clase, para una mejor visualización en el frontend.
    private final String mensaje; // Mensaje descriptivo de la recomendación.
    private final Integer prioridad; // Nivel de prioridad de la recomendación (ej. 1=alta, 3=baja).
    private final LocalDateTime timestamp; // Momento en que se generó la recomendación.

    /**
     * Constructor para inicializar una nueva RecomendacionDTO.
     */
    public RecomendacionDTO(String claseId, String nombreClase, String mensaje, Integer prioridad, LocalDateTime timestamp) {
        this.claseId = claseId;
        this.nombreClase = nombreClase;
        this.mensaje = mensaje;
        this.prioridad = prioridad;
        this.timestamp = timestamp;
    }

    // Métodos getter para acceder a los campos de la RecomendacionDTO.
    public String getClaseId() {
        return claseId;
    }

    public String getNombreClase() {
        return nombreClase;
    }

    public String getMensaje() {
        return mensaje;
    }

    public Integer getPrioridad() {
        return prioridad;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
