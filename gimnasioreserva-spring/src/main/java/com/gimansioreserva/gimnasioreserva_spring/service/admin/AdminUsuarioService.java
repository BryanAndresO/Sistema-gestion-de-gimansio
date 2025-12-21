package com.gimansioreserva.gimnasioreserva_spring.service.admin;

import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Listar todos los usuarios
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // Listar usuarios activos
    @Transactional(readOnly = true)
    public List<Usuario> listarActivos() {
        return usuarioRepository.findByActivo(true);
    }

    // Buscar usuario por ID
    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    // Buscar usuario por correo
    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    // Buscar usuarios por nombre
    @Transactional(readOnly = true)
    public List<Usuario> buscarPorNombre(String nombre) {
        return usuarioRepository.buscarPorNombre(nombre);
    }

    // Buscar usuarios por rol
    @Transactional(readOnly = true)
    public List<Usuario> buscarPorRol(String rol) {
        return usuarioRepository.findByRol(rol);
    }

    // Crear nuevo usuario (solo admin puede crear otros admins)
    @Transactional
    public Usuario crear(Usuario usuario) {
        // Validar que el correo no exista
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // Establecer valores por defecto
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }
        if (usuario.getRol() == null) {
            usuario.setRol("USER");
        }

        // Encriptar la contraseña antes de guardar
        if (usuario.getContrasena() != null && !usuario.getContrasena().isEmpty()) {
            usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        }

        return usuarioRepository.save(usuario);
    }

    // Actualizar usuario
    @Transactional
    public Optional<Usuario> actualizar(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    if (usuarioActualizado.getNombre() != null) {
                        usuario.setNombre(usuarioActualizado.getNombre());
                    }

                    // Solo actualizar correo si cambió, no es nulo y no existe
                    if (usuarioActualizado.getCorreo() != null &&
                            !usuario.getCorreo().equals(usuarioActualizado.getCorreo())) {
                        if (usuarioRepository.existsByCorreo(usuarioActualizado.getCorreo())) {
                            throw new RuntimeException("El correo ya está registrado");
                        }
                        usuario.setCorreo(usuarioActualizado.getCorreo());
                    }

                    // Solo actualizar contraseña si se proporcionó, y encriptarla
                    if (usuarioActualizado.getContrasena() != null &&
                            !usuarioActualizado.getContrasena().isEmpty()) {
                        usuario.setContrasena(passwordEncoder.encode(usuarioActualizado.getContrasena()));
                    }

                    if (usuarioActualizado.getRol() != null) {
                        usuario.setRol(usuarioActualizado.getRol());
                    }
                    if (usuarioActualizado.getActivo() != null) {
                        usuario.setActivo(usuarioActualizado.getActivo());
                    }

                    return usuarioRepository.save(usuario);
                });
    }

    // Cambiar rol de usuario
    @Transactional
    public boolean cambiarRol(Long id, String nuevoRol) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setRol(nuevoRol);
                    usuarioRepository.save(usuario);
                    return true;
                })
                .orElse(false);
    }

    // Desactivar usuario
    @Transactional
    public boolean desactivar(Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setActivo(false);
                    usuarioRepository.save(usuario);
                    return true;
                })
                .orElse(false);
    }

    // Activar usuario
    @Transactional
    public boolean activar(Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    usuario.setActivo(true);
                    usuarioRepository.save(usuario);
                    return true;
                })
                .orElse(false);
    }

    // Eliminar usuario permanentemente
    @Transactional
    public boolean eliminar(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Contar usuarios por rol
    @Transactional(readOnly = true)
    public Long contarPorRol(String rol) {
        return usuarioRepository.contarPorRol(rol);
    }

    // Obtener usuarios con reservas activas
    @Transactional(readOnly = true)
    public List<Usuario> obtenerConReservasActivas() {
        return usuarioRepository.obtenerUsuariosConReservasActivas();
    }

    // Verificar si existe correo
    @Transactional(readOnly = true)
    public boolean existeCorreo(String correo) {
        return usuarioRepository.existsByCorreo(correo);
    }
}