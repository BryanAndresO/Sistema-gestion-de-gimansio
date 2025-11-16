package com.gimansioreserva.gimnasioreserva_spring.web.controller.api;

import com.gimansioreserva.gimnasioreserva_spring.dto.core.ReservaDTO;
import com.gimansioreserva.gimnasioreserva_spring.security.jwt.JwtTokenProvider;
import com.gimansioreserva.gimnasioreserva_spring.service.core.ReservaService;
import com.gimansioreserva.gimnasioreserva_spring.util.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;
    private final JwtTokenProvider jwtTokenProvider;

    public ReservaController(ReservaService reservaService, JwtTokenProvider jwtTokenProvider) {
        this.reservaService = reservaService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private Long obtenerIdUsuarioDesdeToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String correo = jwtTokenProvider.obtenerCorreoDelToken(token);
            // Aquí deberías obtener el ID del usuario desde el correo
            // Por ahora retornamos null y se manejará en el service
            return null; // Se implementará mejor cuando tengamos UserDetails completo
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody Map<String, Long> body, HttpServletRequest request) {
        try {
            Long idUsuario = body.get("idUsuario");
            Long idClase = body.get("idClase");
            
            ReservaDTO reserva = reservaService.crearReserva(idUsuario, idClase);
            return ResponseUtil.created(reserva, "Reserva creada exitosamente");
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarReserva(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        try {
            Long idUsuario = body.get("idUsuario");
            ReservaDTO reserva = reservaService.cancelarReserva(id, idUsuario);
            return ResponseUtil.success(reserva, "Reserva cancelada exitosamente");
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerReservasPorUsuario(@PathVariable Long idUsuario) {
        List<ReservaDTO> reservas = reservaService.obtenerReservasPorUsuario(idUsuario);
        return ResponseUtil.success(reservas);
    }

    @GetMapping("/usuario/{idUsuario}/confirmadas")
    public ResponseEntity<?> obtenerReservasConfirmadas(@PathVariable Long idUsuario) {
        List<ReservaDTO> reservas = reservaService.obtenerReservasConfirmadasPorUsuario(idUsuario);
        return ResponseUtil.success(reservas);
    }

    @GetMapping("/usuario/{idUsuario}/historial")
    public ResponseEntity<?> obtenerHistorial(@PathVariable Long idUsuario) {
        List<ReservaDTO> reservas = reservaService.obtenerHistorialPorUsuario(idUsuario);
        return ResponseUtil.success(reservas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            ReservaDTO reserva = reservaService.obtenerPorId(id);
            return ResponseUtil.success(reserva);
        } catch (Exception e) {
            return ResponseUtil.error(e.getMessage(), org.springframework.http.HttpStatus.NOT_FOUND);
        }
    }
}

