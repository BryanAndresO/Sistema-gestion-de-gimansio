package com.gimansioreserva.gimnasioreserva_spring.service.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.domain.Reserva;
import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;
import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.ReservaDTO;
import com.gimansioreserva.gimnasioreserva_spring.exception.ClaseNoDisponibleException;
import com.gimansioreserva.gimnasioreserva_spring.exception.ReservaDuplicadaException;
import com.gimansioreserva.gimnasioreserva_spring.exception.ReservaNoEncontradaException;
import com.gimansioreserva.gimnasioreserva_spring.mapper.ReservaMapper;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.ReservaRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import com.gimansioreserva.gimnasioreserva_spring.validator.ReservaValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClaseRepository claseRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaMapper reservaMapper;
    private final ReservaValidator reservaValidator;
    private final EventoGymService eventoGymService;

    public ReservaService(ReservaRepository reservaRepository,
                         ClaseRepository claseRepository,
                         UsuarioRepository usuarioRepository,
                         ReservaMapper reservaMapper,
                         ReservaValidator reservaValidator,
                         EventoGymService eventoGymService) {
        this.reservaRepository = reservaRepository;
        this.claseRepository = claseRepository;
        this.usuarioRepository = usuarioRepository;
        this.reservaMapper = reservaMapper;
        this.reservaValidator = reservaValidator;
        this.eventoGymService = eventoGymService;
    }

    @Transactional
    public ReservaDTO crearReserva(Long idUsuario, Long idClase) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Clase clase = claseRepository.findById(idClase)
                .orElseThrow(() -> new ClaseNoDisponibleException(idClase));

        Optional<Reserva> reservaExistente = reservaRepository.buscarReservaDuplicada(idUsuario, idClase);
        if (reservaExistente.isPresent()) {
            throw new ReservaDuplicadaException(idUsuario, idClase);
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setClase(clase);
        reserva.setFechaReserva(LocalDateTime.now());
        reserva.setEstado("CONFIRMADA");

        reservaValidator.validarCrearReserva(reserva, clase);

        Reserva guardada = reservaRepository.save(reserva);

        // Emitir evento de reserva creada
        eventoGymService.emitirEvento(new EventoGym(
                clase.getIdClase().toString(),
                TipoEvento.RESERVA_CREADA
        ));

        // Emitir evento si la clase se llenó
        if (clase.getCuposDisponibles() - 1 == 0) {
            eventoGymService.emitirEvento(new EventoGym(
                    clase.getIdClase().toString(),
                    TipoEvento.CLASE_LLENA
            ));
        }

        return reservaMapper.toDTO(guardada);
    }

    @Transactional
    public ReservaDTO cancelarReserva(Long idReserva, Long idUsuario) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new ReservaNoEncontradaException(idReserva));

        if (!reserva.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("La reserva no pertenece al usuario");
        }

        reservaValidator.validarCancelarReserva(reserva, reserva.getClase());

        reserva.setEstado("CANCELADA");
        Reserva actualizada = reservaRepository.save(reserva);

        // Emitir evento de reserva cancelada
        eventoGymService.emitirEvento(new EventoGym(
                reserva.getClase().getIdClase().toString(),
                TipoEvento.RESERVA_CANCELADA
        ));

        // Emitir evento de cupo disponible
        eventoGymService.emitirEvento(new EventoGym(
                reserva.getClase().getIdClase().toString(),
                TipoEvento.CUPO_DISPONIBLE
        ));

        return reservaMapper.toDTO(actualizada);
    }


    @Transactional(readOnly = true)
    public List<ReservaDTO> obtenerReservasPorUsuario(Long idUsuario) {
        return reservaRepository.findByUsuario_IdUsuario(idUsuario).stream()
                .map(reservaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO> obtenerReservasConfirmadasPorUsuario(Long idUsuario) {
        return reservaRepository.obtenerReservasConfirmadasPorUsuario(idUsuario).stream()
                .map(reservaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservaDTO obtenerPorId(Long idReserva) {
        return reservaRepository.findById(idReserva)
                .map(reservaMapper::toDTO)
                .orElseThrow(() -> new ReservaNoEncontradaException(idReserva));
    }

    @Transactional(readOnly = true)
    public List<ReservaDTO> obtenerHistorialPorUsuario(Long idUsuario) {
        return reservaRepository.findByUsuario_IdUsuario(idUsuario).stream()
                .filter(r -> r.getEstado().equals("CANCELADA") || r.getEstado().equals("COMPLETADA"))
                .map(reservaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void completarReservasPasadas() {
        LocalDateTime ahora = LocalDateTime.now();
        List<Reserva> reservasPasadas = reservaRepository.findByEstado("CONFIRMADA").stream()
                .filter(r -> r.getClase().getHorario().isBefore(ahora))
                .collect(Collectors.toList());
        
        reservasPasadas.forEach(r -> r.setEstado("COMPLETADA"));
        reservaRepository.saveAll(reservasPasadas);
    }
}

