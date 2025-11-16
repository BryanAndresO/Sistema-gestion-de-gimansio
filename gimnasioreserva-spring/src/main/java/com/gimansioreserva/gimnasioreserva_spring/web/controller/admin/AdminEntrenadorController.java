package com.gimansioreserva.gimnasioreserva_spring.web.controller.admin;

import com.gimansioreserva.gimnasioreserva_spring.dto.admin.EntrenadorAdminDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.admin.AdminEntrenadorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/entrenadores")
public class AdminEntrenadorController {

    private final AdminEntrenadorService adminEntrenadorService;

    public AdminEntrenadorController(AdminEntrenadorService adminEntrenadorService) {
        this.adminEntrenadorService = adminEntrenadorService;
    }

    // Listar todos los entrenadores
    @GetMapping
    public ResponseEntity<List<EntrenadorAdminDTO>> listarTodos() {
        List<EntrenadorAdminDTO> entrenadores = adminEntrenadorService.listarTodos();
        return ResponseEntity.ok(entrenadores);
    }

    // Listar entrenadores activos
    @GetMapping("/activos")
    public ResponseEntity<List<EntrenadorAdminDTO>> listarActivos() {
        List<EntrenadorAdminDTO> entrenadores = adminEntrenadorService.listarActivos();
        return ResponseEntity.ok(entrenadores);
    }

    // Buscar entrenador por ID
    @GetMapping("/{id}")
    public ResponseEntity<EntrenadorAdminDTO> buscarPorId(@PathVariable Long id) {
        return adminEntrenadorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar entrenadores por especialidad
    @GetMapping("/especialidad/{especialidad}")
    public ResponseEntity<List<EntrenadorAdminDTO>> buscarPorEspecialidad(@PathVariable String especialidad) {
        List<EntrenadorAdminDTO> entrenadores = adminEntrenadorService.buscarPorEspecialidad(especialidad);
        return ResponseEntity.ok(entrenadores);
    }

    // Buscar entrenadores por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<EntrenadorAdminDTO>> buscarPorNombre(@RequestParam String nombre) {
        List<EntrenadorAdminDTO> entrenadores = adminEntrenadorService.buscarPorNombre(nombre);
        return ResponseEntity.ok(entrenadores);
    }

    // Crear nuevo entrenador
    @PostMapping
    public ResponseEntity<EntrenadorAdminDTO> crear(@RequestBody EntrenadorAdminDTO dto) {
        try {
            EntrenadorAdminDTO creado = adminEntrenadorService.crear(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Actualizar entrenador
    @PutMapping("/{id}")
    public ResponseEntity<EntrenadorAdminDTO> actualizar(
            @PathVariable Long id,
            @RequestBody EntrenadorAdminDTO dto) {
        return adminEntrenadorService.actualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Desactivar entrenador
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        boolean desactivado = adminEntrenadorService.desactivar(id);
        return desactivado ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Activar entrenador
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        boolean activado = adminEntrenadorService.activar(id);
        return activado ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Eliminar entrenador permanentemente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        boolean eliminado = adminEntrenadorService.eliminar(id);
        return eliminado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Obtener especialidades disponibles
    @GetMapping("/especialidades")
    public ResponseEntity<List<String>> obtenerEspecialidades() {
        List<String> especialidades = adminEntrenadorService.obtenerEspecialidades();
        return ResponseEntity.ok(especialidades);
    }

    // Contar clases de un entrenador
    @GetMapping("/{id}/total-clases")
    public ResponseEntity<Long> contarClases(@PathVariable Long id) {
        Long total = adminEntrenadorService.contarClases(id);
        return ResponseEntity.ok(total);
    }
}