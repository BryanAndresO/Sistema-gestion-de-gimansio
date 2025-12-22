package com.gimansioreserva.gimnasioreserva_spring.dto.core;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecomendacionDTO {
    private final String claseId;
    private final String mensaje;
    private final Integer prioridad;
    private final LocalDateTime timestamp;

    public RecomendacionDTO(String claseId, String mensaje, Integer prioridad, LocalDateTime timestamp) {
        this.claseId = claseId;
        this.mensaje = mensaje;
        this.prioridad = prioridad;
        this.timestamp = timestamp;
    }

    public String getClaseId() {
        return claseId;
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
