package com.gimansioreserva.gimnasioreserva_spring;

import com.gimansioreserva.gimnasioreserva_spring.domain.*;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.ReservaDTO;
import com.gimansioreserva.gimnasioreserva_spring.exception.ClaseNoDisponibleException;
import com.gimansioreserva.gimnasioreserva_spring.exception.ReservaDuplicadaException;
import com.gimansioreserva.gimnasioreserva_spring.mapper.ReservaMapper;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.ReservaRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import com.gimansioreserva.gimnasioreserva_spring.service.core.ReservaService;
import com.gimansioreserva.gimnasioreserva_spring.validator.ReservaValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ReservaServiceTest {
    private ReservaRepository reservaRepository;
    private ClaseRepository claseRepository;
    private UsuarioRepository usuarioRepository;
    private ReservaMapper reservaMapper;
    private ReservaValidator reservaValidator;
    private EventoGymService eventoGymService;

    private
    ReservaService reservaService;

    @BeforeEach
    void setup() {
        reservaRepository = mock(ReservaRepository.class);
        claseRepository = mock(ClaseRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        reservaMapper = mock(ReservaMapper.class);
        reservaValidator = mock(ReservaValidator.class);
        eventoGymService = mock(EventoGymService.class);

        reservaService = new ReservaService(
                reservaRepository,
                claseRepository,
                usuarioRepository,
                reservaMapper,
                reservaValidator,
                eventoGymService
        );
    }

    // crearReserva(...)

    @Test
    void crearReserva_usuarioNoExiste_shouldThrow_andNotCallOtherDependencies() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 10L;

        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.empty());

        // Act + Assert
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> reservaService.crearReserva(idUsuario, idClase));

        assertEquals("Usuario no encontrado", ex.getMessage());

        // Verificaciones: falla temprano
        verify(usuarioRepository).findById(idUsuario);
        verifyNoInteractions(claseRepository, reservaRepository, reservaMapper, reservaValidator, eventoGymService);
    }

    @Test
    void crearReserva_claseNoExiste_shouldThrowClaseNoDisponible_andNotSave() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 10L;

        Usuario usuario = mock(Usuario.class);

        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(usuario));
        when(claseRepository.findById(idClase)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(ClaseNoDisponibleException.class,
                () -> reservaService.crearReserva(idUsuario, idClase));

        verify(usuarioRepository).findById(idUsuario);
        verify(claseRepository).findById(idClase);

        verify(reservaRepository, never()).save(any());
        verifyNoInteractions(reservaMapper, reservaValidator, eventoGymService);
    }

    @Test
    void crearReserva_reservaDuplicada_shouldThrowReservaDuplicada_andNotSave() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 10L;

        Usuario usuario = mock(Usuario.class);
        Clase clase = mock(Clase.class);

        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(usuario));
        when(claseRepository.findById(idClase)).thenReturn(Optional.of(clase));
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase))
                .thenReturn(Optional.of(new Reserva()));

        // Act + Assert
        assertThrows(ReservaDuplicadaException.class,
                () -> reservaService.crearReserva(idUsuario, idClase));

        verify(reservaRepository).buscarReservaDuplicada(idUsuario, idClase);
        verify(reservaRepository, never()).save(any());

        verifyNoInteractions(reservaMapper, reservaValidator, eventoGymService);
    }

    @Test
    void crearReserva_valid_shouldSaveReserva_returnDTO_andEmit_RESERVA_CREADA() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 10L;

        Usuario usuario = mock(Usuario.class);
        when(usuario.getIdUsuario()).thenReturn(idUsuario);

        Clase clase = mock(Clase.class);
        when(clase.getIdClase()).thenReturn(idClase);
        when(clase.getCuposDisponibles()).thenReturn(5); // No se llena
        when(clase.getHorario()).thenReturn(LocalDateTime.now().plusDays(1));

        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(usuario));
        when(claseRepository.findById(idClase)).thenReturn(Optional.of(clase));
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.empty());

        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArguments()[0]);

        ReservaDTO dto = new ReservaDTO();
        when(reservaMapper.toDTO(any(Reserva.class))).thenReturn(dto);

        ArgumentCaptor<Reserva> reservaCaptor = ArgumentCaptor.forClass(Reserva.class);
        ArgumentCaptor<EventoGym> eventoCaptor = ArgumentCaptor.forClass(EventoGym.class);

        // Act
        ReservaDTO result = reservaService.crearReserva(idUsuario, idClase);

        // Assert
        assertNotNull(result);

        // Debe validar y guardar
        verify(reservaValidator).validarCrearReserva(any(Reserva.class), eq(clase));
        verify(reservaRepository).save(reservaCaptor.capture());

        Reserva guardada = reservaCaptor.getValue();
        assertNotNull(guardada.getUsuario());
        assertNotNull(guardada.getClase());
        assertNotNull(guardada.getFechaReserva());
        assertEquals("CONFIRMADA", guardada.getEstado());

        // Debe emitir evento RESERVA_CREADA
        verify(eventoGymService, times(1)).emitirEvento(eventoCaptor.capture());
        EventoGym eventoEmitido = eventoCaptor.getValue();
        assertEquals(TipoEvento.RESERVA_CREADA, eventoEmitido.getTipo());
    }

    @Test
    void crearReserva_whenLastSpot_shouldEmit_RESERVA_CREADA_and_CLASE_LLENA() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 10L;

        Usuario usuario = mock(Usuario.class);
        when(usuario.getIdUsuario()).thenReturn(idUsuario);

        Clase clase = mock(Clase.class);
        when(clase.getIdClase()).thenReturn(idClase);
        when(clase.getCuposDisponibles()).thenReturn(1); // (1 - 1 == 0) -> se llena
        when(clase.getHorario()).thenReturn(LocalDateTime.now().plusDays(1));

        when(usuarioRepository.findById(idUsuario)).thenReturn(Optional.of(usuario));
        when(claseRepository.findById(idClase)).thenReturn(Optional.of(clase));
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.empty());

        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArguments()[0]);
        when(reservaMapper.toDTO(any(Reserva.class))).thenReturn(new ReservaDTO());

        ArgumentCaptor<EventoGym> eventoCaptor = ArgumentCaptor.forClass(EventoGym.class);

        // Act
        reservaService.crearReserva(idUsuario, idClase);

        // Assert: se emiten 2 eventos (RESERVA_CREADA y CLASE_LLENA)
        verify(eventoGymService, times(2)).emitirEvento(eventoCaptor.capture());
        List<EventoGym> eventos = eventoCaptor.getAllValues();

        assertTrue(eventos.stream().anyMatch(e -> e.getTipo() == TipoEvento.RESERVA_CREADA));
        assertTrue(eventos.stream().anyMatch(e -> e.getTipo() == TipoEvento.CLASE_LLENA));
    }


}
