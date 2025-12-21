package com.gimansioreserva.gimnasioreserva_spring.web.controller.admin;

import com.gimansioreserva.gimnasioreserva_spring.dto.admin.ClaseAdminDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.admin.AdminClaseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/clases")
public class AdminClaseController {

    private final AdminClaseService adminClaseService;

    public AdminClaseController(AdminClaseService adminClaseService) {
        this.adminClaseService = adminClaseService;
    }

    // Listar todas las clases
    @GetMapping
    public ResponseEntity<List<ClaseAdminDTO>> listarTodas() {
        List<ClaseAdminDTO> clases = adminClaseService.listarTodas();
        return ResponseEntity.ok(clases);
    }

    // Listar clases activas
    @GetMapping("/activas")
    public ResponseEntity<List<ClaseAdminDTO>> listarActivas() {
        List<ClaseAdminDTO> clases = adminClaseService.listarActivas();
        return ResponseEntity.ok(clases);
    }

    // Buscar clase por ID
    @GetMapping("/{id}")
    public ResponseEntity<ClaseAdminDTO> buscarPorId(@PathVariable Long id) {
        return adminClaseService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar clases por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<ClaseAdminDTO>> buscarPorNombre(@RequestParam String nombre) {
        List<ClaseAdminDTO> clases = adminClaseService.buscarPorNombre(nombre);
        return ResponseEntity.ok(clases);
    }

    // Buscar clases por entrenador
    @GetMapping("/entrenador/{idEntrenador}")
    public ResponseEntity<List<ClaseAdminDTO>> buscarPorEntrenador(@PathVariable Long idEntrenador) {
        List<ClaseAdminDTO> clases = adminClaseService.buscarPorEntrenador(idEntrenador);
        return ResponseEntity.ok(clases);
    }

    // Buscar clases por rango de fechas
    @GetMapping("/rango-fechas")
    public ResponseEntity<List<ClaseAdminDTO>> buscarPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        List<ClaseAdminDTO> clases = adminClaseService.buscarPorRangoFechas(inicio, fin);
        return ResponseEntity.ok(clases);
    }

    // Obtener clases disponibles (con cupos)
    @GetMapping("/disponibles")
    public ResponseEntity<List<ClaseAdminDTO>> obtenerDisponibles() {
        List<ClaseAdminDTO> clases = adminClaseService.obtenerDisponibles();
        return ResponseEntity.ok(clases);
    }

    // Obtener clases próximas
    @GetMapping("/proximas")
    public ResponseEntity<List<ClaseAdminDTO>> obtenerProximas() {
        List<ClaseAdminDTO> clases = adminClaseService.obtenerProximas();
        return ResponseEntity.ok(clases);
    }

    // Crear nueva clase
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody ClaseAdminDTO dto) {
        try {
            return adminClaseService.crear(dto)
                    .map(clase -> ResponseEntity.status(HttpStatus.CREATED).body(clase))
                    .orElse(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }

    // Actualizar clase
    @PutMapping("/{id}")
    public ResponseEntity<ClaseAdminDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ClaseAdminDTO dto) {
        return adminClaseService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Desactivar clase
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        boolean desactivada = adminClaseService.desactivar(id);
        return desactivada ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Activar clase
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        boolean activada = adminClaseService.activar(id);
        return activada ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Eliminar clase permanentemente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        boolean eliminada = adminClaseService.eliminar(id);
        return eliminada ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Contar reservas confirmadas de una clase
    @GetMapping("/{id}/total-reservas")
    public ResponseEntity<Long> contarReservas(@PathVariable Long id) {
        Long total = adminClaseService.contarReservas(id);
        return ResponseEntity.ok(total);
    }
}