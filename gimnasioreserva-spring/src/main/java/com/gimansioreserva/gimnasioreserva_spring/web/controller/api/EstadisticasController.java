package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.dto.core.EstadisticaDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EstadisticasService;
import com.gimansioreserva.gimnasioreserva_spring.util.ResponseUtil;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/estadisticas")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    @GetMapping
    public ResponseEntity<?> obtenerEstadisticasGenerales() {
        EstadisticaDTO estadisticas = estadisticasService.obtenerEstadisticasGenerales();
        return ResponseUtil.success(estadisticas);
    }

    @GetMapping("/periodo")
    public ResponseEntity<?> obtenerEstadisticasPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        EstadisticaDTO estadisticas = estadisticasService.obtenerEstadisticasPorPeriodo(inicio, fin);
        return ResponseUtil.success(estadisticas);
    }
}

