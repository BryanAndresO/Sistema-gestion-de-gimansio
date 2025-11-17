package com.gimansioreserva.gimnasioreserva_spring.web.controller.admin;

import com.gimansioreserva.gimnasioreserva_spring.domain.Reserva;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.ReservaDTO;
import com.gimansioreserva.gimnasioreserva_spring.mapper.ReservaMapper;
import com.gimansioreserva.gimnasioreserva_spring.repository.ReservaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reservas")
public class AdminReservaController {

    private final ReservaRepository reservaRepository;
    private final ReservaMapper reservaMapper;

    public AdminReservaController(ReservaRepository reservaRepository, ReservaMapper reservaMapper) {
        this.reservaRepository = reservaRepository;
        this.reservaMapper = reservaMapper;
    }

    // Listar todas las reservas
    @GetMapping
    public ResponseEntity<List<ReservaDTO>> listarTodas() {
        List<ReservaDTO> reservas = reservaRepository.findAll().stream()
                .map(reservaMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reservas);
    }

    // Obtener reserva por ID
    @GetMapping("/{id}")
    public ResponseEntity<ReservaDTO> obtenerPorId(@PathVariable Long id) {
        return reservaRepository.findById(id)
                .map(reservaMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cambiar estado de reserva
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ReservaDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");

        return reservaRepository.findById(id)
                .map(reserva -> {
                    reserva.setEstado(nuevoEstado);
                    Reserva actualizada = reservaRepository.save(reserva);
                    return ResponseEntity.ok(reservaMapper.toDTO(actualizada));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Listar reservas por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<ReservaDTO>> listarPorEstado(@PathVariable String estado) {
        List<ReservaDTO> reservas = reservaRepository.findByEstado(estado).stream()
                .map(reservaMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reservas);
    }

    // Eliminar reserva
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (reservaRepository.existsById(id)) {
            reservaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
