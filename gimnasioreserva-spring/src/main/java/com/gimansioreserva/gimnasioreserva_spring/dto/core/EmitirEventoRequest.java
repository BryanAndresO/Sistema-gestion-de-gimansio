package com.gimansioreserva.gimnasioreserva_spring.dto.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;

/**
 * DTO para emitir eventos de prueba
 */
public class EmitirEventoRequest {

    private String claseId;
    private TipoEvento tipo;

    public String getClaseId() {
        return claseId;
    }

    public void setClaseId(String claseId) {
        this.claseId = claseId;
    }

    public TipoEvento getTipo() {
        return tipo;
    }

    public void setTipo(TipoEvento tipo) {
        this.tipo = tipo;
    }
}
