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

    // Mock del repositorio que accede a los datos de reservas
    @Mock
    private ReservaRepository reservaRepository;

    // Inyecta los mocks en el servicio a probar
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
        // Obtiene fecha actual para configurar horarios relativos
        LocalDateTime ahora = LocalDateTime.now();

        // ESCENARIO 1: Clase con cupos disponibles - para validar cupos positivos
        claseConCupos = new Clase();
        claseConCupos.setIdClase(1L);
        claseConCupos.setNombre("Yoga");
        claseConCupos.setHorario(ahora.plusHours(3)); // 3 horas en futuro
        claseConCupos.setCupo(10);
        claseConCupos.setActivo(true);

        // ESCENARIO 2: Clase sin cupos - para validar excepción de cupo agotado
        claseSinCupos = new Clase();
        claseSinCupos.setIdClase(2L);
        claseSinCupos.setNombre("Pilates");
        claseSinCupos.setHorario(ahora.plusHours(3));
        claseSinCupos.setCupo(1);
        claseSinCupos.setActivo(true);
        claseSinCupos.getReservas().add(reservaConfirmada); // 1 reserva, 0 cupos libres

        // ESCENARIO 3: Clase inactiva - para validar que clases inactivas no se pueden reservar
        claseInactiva = new Clase();
        claseInactiva.setIdClase(3L);
        claseInactiva.setNombre("Spinning");
        claseInactiva.setHorario(ahora.plusHours(3));
        claseInactiva.setCupo(10);
        claseInactiva.setActivo(false); // Clase desactivada

        // ESCENARIO 4: Clase con horario en el pasado - para validar tiempo futuro
        claseHorarioPasado = new Clase();
        claseHorarioPasado.setIdClase(4L);
        claseHorarioPasado.setNombre("Crossfit");
        claseHorarioPasado.setHorario(ahora.minusHours(1)); // 1 hora en pasado
        claseHorarioPasado.setCupo(10);
        claseHorarioPasado.setActivo(true);

        // ESCENARIO 5: Clase con horario en el futuro - para validar tiempo futuro positivo
        claseHorarioFuturo = new Clase();
        claseHorarioFuturo.setIdClase(5L);
        claseHorarioFuturo.setNombre("Zumba");
        claseHorarioFuturo.setHorario(ahora.plusHours(3)); // 3 horas en futuro
        claseHorarioFuturo.setCupo(10);
        claseHorarioFuturo.setActivo(true);

        // Reservas con diferentes estados para validar estados de reserva
        reservaConfirmada = new Reserva();
        reservaConfirmada.setIdReserva(1L);
        reservaConfirmada.setEstado("CONFIRMADA"); // Reserva válida y activa

        reservaCancelada = new Reserva();
        reservaCancelada.setIdReserva(2L);
        reservaCancelada.setEstado("CANCELADA"); // Reserva cancelada
    }

    @Test
    void validarCupoDisponibleConExcepcion_sinCupo_shouldThrowCupoAgotado() {
        // Act + Assert
        assertThrows(CupoAgotadoException.class,
                () -> validacionService.validarCupoDisponibleConExcepcion(claseSinCupos));
    }

    @Test
    void validarReservaDuplicadaConExcepcion_duplicada_shouldThrowReservaDuplicada() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 1L;
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.of(reservaConfirmada));

        // Act + Assert
        assertThrows(ReservaDuplicadaException.class,
                () -> validacionService.validarReservaDuplicadaConExcepcion(idUsuario, idClase));
        
        verify(reservaRepository, times(1)).buscarReservaDuplicada(idUsuario, idClase);
    }

    @Test
    void validarHorarioFuturo_horarioPasado_shouldFalse() {
        // Arrange
        Clase clasePasado = claseHorarioPasado;

        // Act
        boolean resultado = validacionService.validarHorarioFuturo(clasePasado);

        // Assert
        assertFalse(resultado);
    }

    @Test
    void validarHorarioFuturo_horarioFuturo_shouldTrue() {
        // Arrange
        Clase claseFuturo = claseHorarioFuturo;

        // Act
        boolean resultado = validacionService.validarHorarioFuturo(claseFuturo);

        // Assert
        assertTrue(resultado);
    }

    @Test
    void validarTiempoMinimo_menosDe2Horas_shouldFalse() {
        // Arrange
        LocalDateTime horarioCercano = LocalDateTime.now().plusHours(1);

        // Act
        boolean resultado = validacionService.validarTiempoMinimo(horarioCercano);

        // Assert
        assertFalse(resultado);
    }

    @Test
    void validarTiempoMinimo_masDe2Horas_shouldTrue() {
        // Arrange
        LocalDateTime horarioLejano = LocalDateTime.now().plusHours(3);

        // Act
        boolean resultado = validacionService.validarTiempoMinimo(horarioLejano);

        // Assert
        assertTrue(resultado);
    }

    @Test
    void validarClaseActiva_inactiva_shouldFalse() {
        // Arrange
        Clase claseInactiva = this.claseInactiva;

        // Act
        boolean resultado = validacionService.validarClaseActiva(claseInactiva);

        // Assert
        assertFalse(resultado);
    }

    @Test
    void validarClaseActiva_activa_shouldTrue() {
        // Arrange
        Clase claseActiva = claseConCupos;

        // Act
        boolean resultado = validacionService.validarClaseActiva(claseActiva);

        // Assert
        assertTrue(resultado);
    }

    @Test
    void validarReservaConfirmada_estadoConfirmada_shouldTrue() {
        // Arrange
        Reserva reservaConfirmada = this.reservaConfirmada;

        // Act
        boolean resultado = validacionService.validarReservaConfirmada(reservaConfirmada);

        // Assert
        assertTrue(resultado);
    }

    @Test
    void validarReservaConfirmada_estadoCancelada_shouldFalse() {
        // Arrange
        Reserva reservaCancelada = this.reservaCancelada;

        // Act
        boolean resultado = validacionService.validarReservaConfirmada(reservaCancelada);

        // Assert
        assertFalse(resultado);
    }

    @Test
    void validarReservaConfirmada_null_shouldFalse() {
        // Arrange
        Reserva reservaNull = null;

        // Act
        boolean resultado = validacionService.validarReservaConfirmada(reservaNull);

        // Assert
        assertFalse(resultado);
    }

    @Test
    void validarCupoDisponible_conCupos_shouldTrue() {
        // Arrange
        Clase claseConCupos = this.claseConCupos;

        // Act
        boolean resultado = validacionService.validarCupoDisponible(claseConCupos);

        // Assert
        assertTrue(resultado);
    }

    @Test
    void validarCupoDisponible_sinCupos_shouldFalse() {
        // Arrange
        Clase claseSinCupos = this.claseSinCupos;

        // Act
        boolean resultado = validacionService.validarCupoDisponible(claseSinCupos);

        // Assert
        assertFalse(resultado);
    }

    @Test
    void validarReservaDuplicada_existeDuplicada_shouldTrue() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 1L;
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.of(reservaConfirmada));

        // Act
        boolean resultado = validacionService.validarReservaDuplicada(idUsuario, idClase);

        // Assert
        assertTrue(resultado);
        verify(reservaRepository, times(1)).buscarReservaDuplicada(idUsuario, idClase);
    }

    @Test
    void validarReservaDuplicada_noExisteDuplicada_shouldFalse() {
        // Arrange
        Long idUsuario = 1L;
        Long idClase = 1L;
        when(reservaRepository.buscarReservaDuplicada(idUsuario, idClase)).thenReturn(Optional.empty());

        // Act
        boolean resultado = validacionService.validarReservaDuplicada(idUsuario, idClase);

        // Assert
        assertFalse(resultado);
        verify(reservaRepository, times(1)).buscarReservaDuplicada(idUsuario, idClase);
    }
}
