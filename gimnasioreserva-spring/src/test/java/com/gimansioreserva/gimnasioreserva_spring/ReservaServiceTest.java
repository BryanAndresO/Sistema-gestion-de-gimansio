package com.gimansioreserva.gimnasioreserva_spring;

import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.exception.ClaseNoDisponibleException;
import com.gimansioreserva.gimnasioreserva_spring.mapper.ReservaMapper;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.ReservaRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import com.gimansioreserva.gimnasioreserva_spring.service.core.ReservaService;
import com.gimansioreserva.gimnasioreserva_spring.validator.ReservaValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

}
