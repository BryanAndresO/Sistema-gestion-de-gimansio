package com.gimansioreserva.gimnasioreserva_spring.unit.service;

import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import com.gimansioreserva.gimnasioreserva_spring.domain.Reserva;
import com.gimansioreserva.gimnasioreserva_spring.exception.CupoAgotadoException;
import com.gimansioreserva.gimnasioreserva_spring.exception.ReservaDuplicadaException;
import com.gimansioreserva.gimnasioreserva_spring.repository.ReservaRepository;
import com.gimansioreserva.gimnasioreserva_spring.service.core.ValidacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ValidacionServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @InjectMocks
    private ValidacionService validacionService;

    private Clase claseConCupos;
    private Clase claseSinCupos;
    private Clase claseInactiva;
    private Clase claseHorarioPasado;
    private Clase claseHorarioFuturo;
    private Reserva reservaConfirmada;
    private Reserva reservaCancelada;

    @BeforeEach
    void setUp() {
        LocalDateTime ahora = LocalDateTime.now();

        claseConCupos = new Clase();
        claseConCupos.setIdClase(1L);
        claseConCupos.setNombre("Yoga");
        claseConCupos.setHorario(ahora.plusHours(3));
        claseConCupos.setCupo(10);
        claseConCupos.setActivo(true);

        claseSinCupos = new Clase();
        claseSinCupos.setIdClase(2L);
        claseSinCupos.setNombre("Pilates");
        claseSinCupos.setHorario(ahora.plusHours(3));
        claseSinCupos.setCupo(1);
        claseSinCupos.setActivo(true);
        // Agregar una reserva para que no haya cupos disponibles
        claseSinCupos.getReservas().add(reservaConfirmada);

        claseInactiva = new Clase();
        claseInactiva.setIdClase(3L);
        claseInactiva.setNombre("Spinning");
        claseInactiva.setHorario(ahora.plusHours(3));
        claseInactiva.setCupo(10);
        claseInactiva.setActivo(false);

        claseHorarioPasado = new Clase();
        claseHorarioPasado.setIdClase(4L);
        claseHorarioPasado.setNombre("Crossfit");
        claseHorarioPasado.setHorario(ahora.minusHours(1));
        claseHorarioPasado.setCupo(10);
        claseHorarioPasado.setActivo(true);

        claseHorarioFuturo = new Clase();
        claseHorarioFuturo.setIdClase(5L);
        claseHorarioFuturo.setNombre("Zumba");
        claseHorarioFuturo.setHorario(ahora.plusHours(3));
        claseHorarioFuturo.setCupo(10);
        claseHorarioFuturo.setActivo(true);

        reservaConfirmada = new Reserva();
        reservaConfirmada.setIdReserva(1L);
        reservaConfirmada.setEstado("CONFIRMADA");

        reservaCancelada = new Reserva();
        reservaCancelada.setIdReserva(2L);
        reservaCancelada.setEstado("CANCELADA");
    }

    @Test
    void validarCupoDisponibleConExcepcion_sinCupo_shouldThrowCupoAgotado() {
        // When & Then
        CupoAgotadoException exception = assertThrows(
                CupoAgotadoException.class,
                () -> validacionService.validarCupoDisponibleConExcepcion(claseSinCupos)
        );

        assertNotNull(exception);
    }

    @Test
    void validarReservaDuplicadaConExcepcion_duplicada_shouldThrowReservaDuplicada() {
        // Given
        Long idUsuario = 1L;
        Long idClase = 1L;
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.of(reservaConfirmada));

        // When & Then
        ReservaDuplicadaException exception = assertThrows(
                ReservaDuplicadaException.class,
                () -> validacionService.validarReservaDuplicadaConExcepcion(idUsuario, idClase)
        );

        assertNotNull(exception);
        verify(reservaRepository, times(1)).buscarReservaDuplicada(idUsuario, idClase);
    }

    @Test
    void validarHorarioFuturo_horarioPasado_shouldFalse() {
        // Given
        Clase clasePasado = claseHorarioPasado;

        // When
        boolean resultado = validacionService.validarHorarioFuturo(clasePasado);

        // Then
        assertFalse(resultado);
    }

    @Test
    void validarHorarioFuturo_horarioFuturo_shouldTrue() {
        // Given
        Clase claseFuturo = claseHorarioFuturo;

        // When
        boolean resultado = validacionService.validarHorarioFuturo(claseFuturo);

        // Then
        assertTrue(resultado);
    }

    @Test
    void validarTiempoMinimo_menosDe2Horas_shouldFalse() {
        // Given
        LocalDateTime horarioCercano = LocalDateTime.now().plusHours(1);

        // When
        boolean resultado = validacionService.validarTiempoMinimo(horarioCercano);

        // Then
        assertFalse(resultado);
    }

    @Test
    void validarTiempoMinimo_masDe2Horas_shouldTrue() {
        // Given
        LocalDateTime horarioLejano = LocalDateTime.now().plusHours(3);

        // When
        boolean resultado = validacionService.validarTiempoMinimo(horarioLejano);

        // Then
        assertTrue(resultado);
    }

    @Test
    void validarClaseActiva_inactiva_shouldFalse() {
        // Given
        Clase claseInactiva = this.claseInactiva;

        // When
        boolean resultado = validacionService.validarClaseActiva(claseInactiva);

        // Then
        assertFalse(resultado);
    }

    @Test
    void validarClaseActiva_activa_shouldTrue() {
        // Given
        Clase claseActiva = claseConCupos;

        // When
        boolean resultado = validacionService.validarClaseActiva(claseActiva);

        // Then
        assertTrue(resultado);
    }

    @Test
    void validarReservaConfirmada_estadoConfirmada_shouldTrue() {
        // Given
        Reserva reservaConfirmada = this.reservaConfirmada;

        // When
        boolean resultado = validacionService.validarReservaConfirmada(reservaConfirmada);

        // Then
        assertTrue(resultado);
    }

    @Test
    void validarReservaConfirmada_estadoCancelada_shouldFalse() {
        // Given
        Reserva reservaCancelada = this.reservaCancelada;

        // When
        boolean resultado = validacionService.validarReservaConfirmada(reservaCancelada);

        // Then
        assertFalse(resultado);
    }

    @Test
    void validarReservaConfirmada_null_shouldFalse() {
        // Given
        Reserva reservaNull = null;

        // When
        boolean resultado = validacionService.validarReservaConfirmada(reservaNull);

        // Then
        assertFalse(resultado);
    }

    @Test
    void validarCupoDisponible_conCupos_shouldTrue() {
        // Given
        Clase claseConCupos = this.claseConCupos;

        // When
        boolean resultado = validacionService.validarCupoDisponible(claseConCupos);

        // Then
        assertTrue(resultado);
    }

    @Test
    void validarCupoDisponible_sinCupos_shouldFalse() {
        // Given
        Clase claseSinCupos = this.claseSinCupos;

        // When
        boolean resultado = validacionService.validarCupoDisponible(claseSinCupos);

        // Then
        assertFalse(resultado);
    }

    @Test
    void validarReservaDuplicada_existeDuplicada_shouldTrue() {
        // Given
        Long idUsuario = 1L;
        Long idClase = 1L;
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.of(reservaConfirmada));

        // When
        boolean resultado = validacionService.validarReservaDuplicada(idUsuario, idClase);

        // Then
        assertTrue(resultado);
        verify(reservaRepository, times(1)).buscarReservaDuplicada(idUsuario, idClase);
    }

    @Test
    void validarReservaDuplicada_noExisteDuplicada_shouldFalse() {
        // Given
        Long idUsuario = 1L;
        Long idClase = 1L;
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.empty());

        // When
        boolean resultado = validacionService.validarReservaDuplicada(idUsuario, idClase);

        // Then
        assertFalse(resultado);
        verify(reservaRepository, times(1)).buscarReservaDuplicada(idUsuario, idClase);
    }
}
