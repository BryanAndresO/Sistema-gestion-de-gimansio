package com.gimansioreserva.gimnasioreserva_spring.web.controller.admin;

import com.gimansioreserva.gimnasioreserva_spring.dto.admin.ReporteDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.admin.AdminReporteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reportes")
public class AdminReporteController {

    private final AdminReporteService adminReporteService;

    public AdminReporteController(AdminReporteService adminReporteService) {
        this.adminReporteService = adminReporteService;
    }

    // Generar reporte general
    @GetMapping("/general")
    public ResponseEntity<ReporteDTO> generarReporteGeneral() {
        ReporteDTO reporte = adminReporteService.generarReporteGeneral();
        return ResponseEntity.ok(reporte);
    }

    // Generar reporte por periodo personalizado
    @GetMapping("/periodo")
    public ResponseEntity<ReporteDTO> generarReportePorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        ReporteDTO reporte = adminReporteService.generarReportePorPeriodo(inicio, fin);
        return ResponseEntity.ok(reporte);
    }

    // Generar reporte mensual
    @GetMapping("/mensual")
    public ResponseEntity<ReporteDTO> generarReporteMensual(
            @RequestParam int mes,
            @RequestParam int anio) {
        ReporteDTO reporte = adminReporteService.generarReporteMensual(mes, anio);
        return ResponseEntity.ok(reporte);
    }

    // Generar reporte semanal
    @GetMapping("/semanal")
    public ResponseEntity<ReporteDTO> generarReporteSemanal() {
        ReporteDTO reporte = adminReporteService.generarReporteSemanal();
        return ResponseEntity.ok(reporte);
    }

    // Generar reporte diario
    @GetMapping("/diario")
    public ResponseEntity<ReporteDTO> generarReporteDiario() {
        ReporteDTO reporte = adminReporteService.generarReporteDiario();
        return ResponseEntity.ok(reporte);
    }

    // Obtener estadísticas de entrenadores
    @GetMapping("/estadisticas/entrenadores")
    public ResponseEntity<Map<String, Integer>> obtenerEstadisticasEntrenadores() {
        Map<String, Integer> estadisticas = adminReporteService.obtenerEstadisticasEntrenadores();
        return ResponseEntity.ok(estadisticas);
    }
}