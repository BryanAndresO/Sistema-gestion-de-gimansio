package com.gimansioreserva.gimnasioreserva_spring.domain;

import java.time.LocalDateTime;

public class EventoGym {
    private final String claseId;
    private final TipoEvento tipo;
    private final LocalDateTime timestamp;

    public EventoGym(String claseId, TipoEvento tipo) {
        this.claseId = claseId;
        this.tipo = tipo;
        this.timestamp = LocalDateTime.now();
    }

    public String getClaseId() {
        return claseId;
    }

    public TipoEvento getTipo() {
        return tipo;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
