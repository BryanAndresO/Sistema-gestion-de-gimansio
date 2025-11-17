package com.gimansioreserva.gimnasioreserva_spring.service.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.DisponibilidadDTO;
import com.gimansioreserva.gimnasioreserva_spring.exception.ClaseNoDisponibleException;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisponibilidadService {

    private static final long HORAS_MINIMAS_ANTICIPACION = 2;

    private final ClaseRepository claseRepository;

    public DisponibilidadService(ClaseRepository claseRepository) {
        this.claseRepository = claseRepository;
    }

    @Transactional(readOnly = true)
    public DisponibilidadDTO verificarDisponibilidad(Long idClase) {
        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new ClaseNoDisponibleException(idClase));

        DisponibilidadDTO dto = new DisponibilidadDTO();
        dto.setIdClase(clase.getIdClase());
        dto.setNombreClase(clase.getNombre());
        dto.setHorario(clase.getHorario());
        dto.setCupoTotal(clase.getCupo());
        
        int reservasConfirmadas = (int) clase.getReservas().stream()
                .filter(r -> r.getEstado().equals("CONFIRMADA"))
                .count();
        
        dto.setCuposOcupados(reservasConfirmadas);
        dto.setCuposDisponibles(clase.getCupo() - reservasConfirmadas);
        dto.setDisponible(clase.getActivo() && dto.getCuposDisponibles() > 0);
        
        // Puede reservar si está disponible y cumple el tiempo mínimo
        boolean puedeReservar = dto.getDisponible() && 
                clase.getHorario().isAfter(LocalDateTime.now().plusHours(HORAS_MINIMAS_ANTICIPACION));
        dto.setPuedeReservar(puedeReservar);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<DisponibilidadDTO> obtenerDisponibilidadClases() {
        return claseRepository.findByActivo(true).stream()
                .map(this::convertirADisponibilidadDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DisponibilidadDTO> obtenerClasesConCuposDisponibles() {
        return claseRepository.obtenerClasesDisponibles().stream()
                .map(this::convertirADisponibilidadDTO)
                .collect(Collectors.toList());
    }

    private DisponibilidadDTO convertirADisponibilidadDTO(Clase clase) {
        DisponibilidadDTO dto = new DisponibilidadDTO();
        dto.setIdClase(clase.getIdClase());
        dto.setNombreClase(clase.getNombre());
        dto.setHorario(clase.getHorario());
        dto.setCupoTotal(clase.getCupo());
        
        int reservasConfirmadas = (int) clase.getReservas().stream()
                .filter(r -> r.getEstado().equals("CONFIRMADA"))
                .count();
        
        dto.setCuposOcupados(reservasConfirmadas);
        dto.setCuposDisponibles(clase.getCupo() - reservasConfirmadas);
        dto.setDisponible(clase.getActivo() && dto.getCuposDisponibles() > 0);
        
        boolean puedeReservar = dto.getDisponible() && 
                clase.getHorario().isAfter(LocalDateTime.now().plusHours(HORAS_MINIMAS_ANTICIPACION));
        dto.setPuedeReservar(puedeReservar);

        return dto;
    }
}

