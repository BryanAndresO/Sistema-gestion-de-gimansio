package com.gimansioreserva.gimnasioreserva_spring.web.controller.admin;

import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.service.admin.AdminUsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioController {

    private final AdminUsuarioService adminUsuarioService;

    public AdminUsuarioController(AdminUsuarioService adminUsuarioService) {
        this.adminUsuarioService = adminUsuarioService;
    }

    // Listar todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        List<Usuario> usuarios = adminUsuarioService.listarTodos();
        return ResponseEntity.ok(usuarios);
    }

    // Listar usuarios activos
    @GetMapping("/activos")
    public ResponseEntity<List<Usuario>> listarActivos() {
        List<Usuario> usuarios = adminUsuarioService.listarActivos();
        return ResponseEntity.ok(usuarios);
    }

    // Buscar usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return adminUsuarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar usuario por correo
    @GetMapping("/correo/{correo}")
    public ResponseEntity<Usuario> buscarPorCorreo(@PathVariable String correo) {
        return adminUsuarioService.buscarPorCorreo(correo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar usuarios por nombre
    @GetMapping("/buscar")
    public ResponseEntity<List<Usuario>> buscarPorNombre(@RequestParam String nombre) {
        List<Usuario> usuarios = adminUsuarioService.buscarPorNombre(nombre);
        return ResponseEntity.ok(usuarios);
    }

    // Buscar usuarios por rol
    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<Usuario>> buscarPorRol(@PathVariable String rol) {
        List<Usuario> usuarios = adminUsuarioService.buscarPorRol(rol);
        return ResponseEntity.ok(usuarios);
    }

    // Crear nuevo usuario
    @PostMapping
    public ResponseEntity<Usuario> crear(@RequestBody Usuario usuario) {
        try {
            Usuario creado = adminUsuarioService.crear(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(
            @PathVariable Long id,
            @RequestBody Usuario usuario) {
        try {
            return adminUsuarioService.actualizar(id, usuario)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Cambiar rol de usuario
    @PatchMapping("/{id}/rol")
    public ResponseEntity<Void> cambiarRol(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("rol");
        boolean cambiado = adminUsuarioService.cambiarRol(id, nuevoRol);
        return cambiado ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Desactivar usuario
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        boolean desactivado = adminUsuarioService.desactivar(id);
        return desactivado ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Activar usuario
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        boolean activado = adminUsuarioService.activar(id);
        return activado ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // Eliminar usuario permanentemente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        boolean eliminado = adminUsuarioService.eliminar(id);
        return eliminado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Contar usuarios por rol
    @GetMapping("/contar/rol/{rol}")
    public ResponseEntity<Long> contarPorRol(@PathVariable String rol) {
        Long total = adminUsuarioService.contarPorRol(rol);
        return ResponseEntity.ok(total);
    }

    // Obtener usuarios con reservas activas
    @GetMapping("/con-reservas-activas")
    public ResponseEntity<List<Usuario>> obtenerConReservasActivas() {
        List<Usuario> usuarios = adminUsuarioService.obtenerConReservasActivas();
        return ResponseEntity.ok(usuarios);
    }

    // Verificar si existe correo
    @GetMapping("/existe-correo/{correo}")
    public ResponseEntity<Boolean> existeCorreo(@PathVariable String correo) {
        boolean existe = adminUsuarioService.existeCorreo(correo);
        return ResponseEntity.ok(existe);
    }
}