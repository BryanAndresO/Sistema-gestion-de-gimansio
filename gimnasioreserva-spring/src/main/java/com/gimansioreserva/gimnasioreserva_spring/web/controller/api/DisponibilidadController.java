package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.dto.core.DisponibilidadDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.core.DisponibilidadService;
import com.gimansioreserva.gimnasioreserva_spring.util.ResponseUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disponibilidad")
public class DisponibilidadController {

    private final DisponibilidadService disponibilidadService;

    public DisponibilidadController(DisponibilidadService disponibilidadService) {
        this.disponibilidadService = disponibilidadService;
    }

    @GetMapping("/clase/{idClase}")
    public ResponseEntity<?> verificarDisponibilidad(@PathVariable Long idClase) {
        try {
            DisponibilidadDTO disponibilidad = disponibilidadService.verificarDisponibilidad(idClase);
            return ResponseUtil.success(disponibilidad);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/clases")
    public ResponseEntity<?> obtenerDisponibilidadClases() {
        List<DisponibilidadDTO> disponibilidad = disponibilidadService.obtenerDisponibilidadClases();
        return ResponseUtil.success(disponibilidad);
    }

    @GetMapping("/clases/disponibles")
    public ResponseEntity<?> obtenerClasesConCuposDisponibles() {
        List<DisponibilidadDTO> disponibilidad = disponibilidadService.obtenerClasesConCuposDisponibles();
        return ResponseUtil.success(disponibilidad);
    }
}

