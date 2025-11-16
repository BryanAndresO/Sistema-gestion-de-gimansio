package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.dto.core.ClaseDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.core.ClaseService;
import com.gimansioreserva.gimnasioreserva_spring.util.ResponseUtil;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/clases")
public class ClaseController {

    private final ClaseService claseService;

    public ClaseController(ClaseService claseService) {
        this.claseService = claseService;
    }

    @GetMapping
    public ResponseEntity<?> obtenerClasesDisponibles() {
        List<ClaseDTO> clases = claseService.obtenerClasesDisponibles();
        return ResponseUtil.success(clases);
    }

    @GetMapping("/proximas")
    public ResponseEntity<?> obtenerClasesProximas() {
        List<ClaseDTO> clases = claseService.obtenerClasesProximas();
        return ResponseUtil.success(clases);
    }

    @GetMapping("/activas")
    public ResponseEntity<?> obtenerClasesActivas() {
        List<ClaseDTO> clases = claseService.obtenerClasesActivas();
        return ResponseUtil.success(clases);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return claseService.obtenerPorId(id)
                .map(clase -> ResponseUtil.success(clase))
                .orElse(ResponseUtil.notFound("Clase no encontrada"));
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(@RequestParam String nombre) {
        List<ClaseDTO> clases = claseService.buscarPorNombre(nombre);
        return ResponseUtil.success(clases);
    }

    @GetMapping("/entrenador/{idEntrenador}")
    public ResponseEntity<?> obtenerPorEntrenador(@PathVariable Long idEntrenador) {
        List<ClaseDTO> clases = claseService.obtenerPorEntrenador(idEntrenador);
        return ResponseUtil.success(clases);
    }

    @GetMapping("/rango-fechas")
    public ResponseEntity<?> obtenerPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        List<ClaseDTO> clases = claseService.obtenerPorRangoFechas(inicio, fin);
        return ResponseUtil.success(clases);
    }
}

