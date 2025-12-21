package com.gimansioreserva.gimnasioreserva_spring.service.admin;

import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import com.gimansioreserva.gimnasioreserva_spring.domain.Entrenador;
import com.gimansioreserva.gimnasioreserva_spring.dto.admin.ClaseAdminDTO;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.EntrenadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminClaseService {

    private final ClaseRepository claseRepository;
    private final EntrenadorRepository entrenadorRepository;

    public AdminClaseService(ClaseRepository claseRepository, EntrenadorRepository entrenadorRepository) {
        this.claseRepository = claseRepository;
        this.entrenadorRepository = entrenadorRepository;
    }

    // Listar todas las clases
    @Transactional(readOnly = true)
    public List<ClaseAdminDTO> listarTodas() {
        return claseRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Listar clases activas
    @Transactional(readOnly = true)
    public List<ClaseAdminDTO> listarActivas() {
        return claseRepository.findByActivo(true).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Buscar clase por ID
    @Transactional(readOnly = true)
    public Optional<ClaseAdminDTO> buscarPorId(Long id) {
        return claseRepository.findById(id)
                .map(this::convertirADTO);
    }

    // Buscar clases por nombre
    @Transactional(readOnly = true)
    public List<ClaseAdminDTO> buscarPorNombre(String nombre) {
        return claseRepository.buscarPorNombre(nombre).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Buscar clases por entrenador
    @Transactional(readOnly = true)
    public List<ClaseAdminDTO> buscarPorEntrenador(Long idEntrenador) {
        return claseRepository.findByEntrenador_IdEntrenador(idEntrenador).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Buscar clases por rango de fechas
    @Transactional(readOnly = true)
    public List<ClaseAdminDTO> buscarPorRangoFechas(LocalDateTime inicio, LocalDateTime fin) {
        return claseRepository.buscarPorRangoFechas(inicio, fin).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Obtener clases disponibles (con cupos)
    @Transactional(readOnly = true)
    public List<ClaseAdminDTO> obtenerDisponibles() {
        return claseRepository.obtenerClasesDisponibles().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Obtener clases próximas
    @Transactional(readOnly = true)
    public List<ClaseAdminDTO> obtenerProximas() {
        return claseRepository.obtenerClasesProximas(LocalDateTime.now()).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // Crear nueva clase
    @Transactional
    public Optional<ClaseAdminDTO> crear(ClaseAdminDTO dto) {
        Entrenador entrenador = entrenadorRepository.findById(dto.getIdEntrenador())
                .orElseThrow(() -> new RuntimeException("Entrenador no encontrado con ID: " + dto.getIdEntrenador()));

        Clase clase = new Clase();
        clase.setNombre(dto.getNombre());
        clase.setDescripcion(dto.getDescripcion());
        clase.setHorario(dto.getHorario());
        clase.setCupo(dto.getCupo());
        clase.setDuracionMinutos(dto.getDuracionMinutos() != null ? dto.getDuracionMinutos() : 60);
        clase.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        clase.setEntrenador(entrenador);

        Clase guardada = claseRepository.save(clase);
        return Optional.of(convertirADTO(guardada));
    }

    // Actualizar clase
    @Transactional
    public Optional<ClaseAdminDTO> actualizar(Long id, ClaseAdminDTO dto) {
        return claseRepository.findById(id)
                .flatMap(clase -> {
                    clase.setNombre(dto.getNombre());
                    clase.setDescripcion(dto.getDescripcion());
                    clase.setHorario(dto.getHorario());
                    clase.setCupo(dto.getCupo());
                    clase.setDuracionMinutos(dto.getDuracionMinutos());
                    clase.setActivo(dto.getActivo());

                    // Actualizar entrenador si cambió
                    if (dto.getIdEntrenador() != null &&
                            !dto.getIdEntrenador().equals(clase.getEntrenador().getIdEntrenador())) {
                        return entrenadorRepository.findById(dto.getIdEntrenador())
                                .map(entrenador -> {
                                    clase.setEntrenador(entrenador);
                                    Clase actualizada = claseRepository.save(clase);
                                    return convertirADTO(actualizada);
                                });
                    }

                    Clase actualizada = claseRepository.save(clase);
                    return Optional.of(convertirADTO(actualizada));
                });
    }

    // Desactivar clase
    @Transactional
    public boolean desactivar(Long id) {
        return claseRepository.findById(id)
                .map(clase -> {
                    clase.setActivo(false);
                    claseRepository.save(clase);
                    return true;
                })
                .orElse(false);
    }

    // Activar clase
    @Transactional
    public boolean activar(Long id) {
        return claseRepository.findById(id)
                .map(clase -> {
                    clase.setActivo(true);
                    claseRepository.save(clase);
                    return true;
                })
                .orElse(false);
    }

    // Eliminar clase permanentemente
    @Transactional
    public boolean eliminar(Long id) {
        if (claseRepository.existsById(id)) {
            claseRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Contar reservas confirmadas
    @Transactional(readOnly = true)
    public Long contarReservas(Long idClase) {
        return claseRepository.contarReservasConfirmadas(idClase);
    }

    // Método privado para convertir Entidad a DTO
    private ClaseAdminDTO convertirADTO(Clase clase) {
        ClaseAdminDTO dto = new ClaseAdminDTO();
        dto.setIdClase(clase.getIdClase());
        dto.setNombre(clase.getNombre());
        dto.setDescripcion(clase.getDescripcion());
        dto.setHorario(clase.getHorario());
        dto.setCupo(clase.getCupo());
        dto.setCuposDisponibles(clase.getCuposDisponibles());
        dto.setDuracionMinutos(clase.getDuracionMinutos());
        dto.setActivo(clase.getActivo());

        // Información del entrenador
        Entrenador entrenador = clase.getEntrenador();
        dto.setIdEntrenador(entrenador.getIdEntrenador());
        dto.setNombreEntrenador(entrenador.getNombre());
        dto.setEspecialidadEntrenador(entrenador.getEspecialidad());

        // Estadísticas
        dto.setTotalReservas(clase.getReservas().size());
        dto.setReservasConfirmadas((int) clase.getReservas().stream()
                .filter(r -> r.getEstado().equals("CONFIRMADA"))
                .count());

        return dto;
    }
}