package com.gimansioreserva.gimnasioreserva_spring.controller;

import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador simple para facilitar pruebas del sistema de recomendaciones
 * Sin autenticación para facilitar el testing
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private EventoGymService eventoGymService;

    /**
     * Endpoint simple para simular eventos sin necesidad de JSON
     */
    @PostMapping("/evento/{claseId}/{tipo}")
    public Map<String, Object> simularEventoSimple(
            @PathVariable String claseId,
            @PathVariable TipoEvento tipo) {
        
        eventoGymService.emitirEvento(
            new com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym(claseId, tipo)
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Evento emitido correctamente");
        response.put("claseId", claseId);
        response.put("tipo", tipo);
        response.put("timestamp", java.time.LocalDateTime.now());
        
        return response;
    }

    /**
     * Endpoint para simular múltiples eventos de prueba
     */
    @PostMapping("/eventos-lote")
    public Map<String, Object> simularEventosLote() {
        
        // Simular varios eventos de prueba
        eventoGymService.emitirEvento(
            new com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym("1", TipoEvento.CUPO_DISPONIBLE)
        );
        
        eventoGymService.emitirEvento(
            new com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym("YOGA-101", TipoEvento.CLASE_LLENA)
        );
        
        eventoGymService.emitirEvento(
            new com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym("SPINNING-202", TipoEvento.CAMBIO_HORARIO)
        );
        
        eventoGymService.emitirEvento(
            new com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym("3", TipoEvento.RESERVA_CREADA)
        );
        
        eventoGymService.emitirEvento(
            new com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym("4", TipoEvento.RESERVA_CANCELADA)
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "5 eventos de prueba emitidos");
        response.put("eventos", java.util.List.of(
            "1:CUPO_DISPONIBLE",
            "YOGA-101:CLASE_LLENA", 
            "SPINNING-202:CAMBIO_HORARIO",
            "3:RESERVA_CREADA",
            "4:RESERVA_CANCELADA"
        ));
        
        return response;
    }
}
