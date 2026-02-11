package com.gimansioreserva.gimnasioreserva_spring.unit.service;

import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import com.gimansioreserva.gimnasioreserva_spring.domain.Reserva;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.DisponibilidadDTO;
import com.gimansioreserva.gimnasioreserva_spring.exception.ClaseNoDisponibleException;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.service.core.DisponibilidadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DisponibilidadServiceTest {

    @Mock
    private ClaseRepository claseRepository;

    @InjectMocks
    private DisponibilidadService disponibilidadService;

    private Clase claseActivaConCupos;
    private Clase claseInactiva;
    private Clase claseSinCupos;
    private Clase claseHorarioCercano;
    private Clase claseHorarioLejano;
    private Reserva reservaConfirmada;

    @BeforeEach
    void setUp() {
        LocalDateTime ahora = LocalDateTime.now();
        
        reservaConfirmada = new Reserva();
        reservaConfirmada.setEstado("CONFIRMADA");

        claseActivaConCupos = new Clase();
        claseActivaConCupos.setIdClase(1L);
        claseActivaConCupos.setNombre("Yoga");
        claseActivaConCupos.setHorario(ahora.plusHours(3));
        claseActivaConCupos.setCupo(10);
        claseActivaConCupos.setActivo(true);
        claseActivaConCupos.setReservas(Arrays.asList(reservaConfirmada));

        claseInactiva = new Clase();
        claseInactiva.setIdClase(2L);
        claseInactiva.setNombre("Pilates");
        claseInactiva.setHorario(ahora.plusHours(3));
        claseInactiva.setCupo(10);
        claseInactiva.setActivo(false);
        claseInactiva.setReservas(Arrays.asList(reservaConfirmada));

        claseSinCupos = new Clase();
        claseSinCupos.setIdClase(3L);
        claseSinCupos.setNombre("Spinning");
        claseSinCupos.setHorario(ahora.plusHours(3));
        claseSinCupos.setCupo(1);
        claseSinCupos.setActivo(true);
        claseSinCupos.setReservas(Arrays.asList(reservaConfirmada));

        claseHorarioCercano = new Clase();
        claseHorarioCercano.setIdClase(4L);
        claseHorarioCercano.setNombre("Crossfit");
        claseHorarioCercano.setHorario(ahora.plusHours(1));
        claseHorarioCercano.setCupo(10);
        claseHorarioCercano.setActivo(true);
        claseHorarioCercano.setReservas(Arrays.asList(reservaConfirmada));

        claseHorarioLejano = new Clase();
        claseHorarioLejano.setIdClase(5L);
        claseHorarioLejano.setNombre("Zumba");
        claseHorarioLejano.setHorario(ahora.plusHours(5));
        claseHorarioLejano.setCupo(10);
        claseHorarioLejano.setActivo(true);
        claseHorarioLejano.setReservas(Arrays.asList(reservaConfirmada));
    }

    @Test
    void verificarDisponibilidad_claseNoExiste_shouldThrow() {
        // Given
        Long idClaseInexistente = 999L;
        when(claseRepository.findById(idClaseInexistente)).thenReturn(Optional.empty());

        // When & Then
        ClaseNoDisponibleException exception = assertThrows(
                ClaseNoDisponibleException.class,
                () -> disponibilidadService.verificarDisponibilidad(idClaseInexistente)
        );

        assertEquals("La clase con ID " + idClaseInexistente + " no está disponible", exception.getMessage());
        verify(claseRepository, times(1)).findById(idClaseInexistente);
    }

    @Test
    void verificarDisponibilidad_activaConCupos_shouldDisponibleTrue() {
        // Given
        Long idClaseActiva = 1L;
        when(claseRepository.findById(idClaseActiva)).thenReturn(Optional.of(claseActivaConCupos));

        // When
        DisponibilidadDTO resultado = disponibilidadService.verificarDisponibilidad(idClaseActiva);

        // Then
        assertNotNull(resultado);
        assertEquals(idClaseActiva, resultado.getIdClase());
        assertEquals("Yoga", resultado.getNombreClase());
        assertEquals(claseActivaConCupos.getHorario(), resultado.getHorario());
        assertEquals(10, resultado.getCupoTotal());
        assertEquals(1, resultado.getCuposOcupados());
        assertEquals(9, resultado.getCuposDisponibles());
        assertTrue(resultado.getDisponible());
        assertTrue(resultado.getPuedeReservar());
        
        verify(claseRepository, times(1)).findById(idClaseActiva);
    }

    @Test
    void verificarDisponibilidad_inactiva_shouldDisponibleFalse() {
        // Given
        Long idClaseInactiva = 2L;
        when(claseRepository.findById(idClaseInactiva)).thenReturn(Optional.of(claseInactiva));

        // When
        DisponibilidadDTO resultado = disponibilidadService.verificarDisponibilidad(idClaseInactiva);

        // Then
        assertNotNull(resultado);
        assertEquals(idClaseInactiva, resultado.getIdClase());
        assertEquals("Pilates", resultado.getNombreClase());
        assertEquals(claseInactiva.getHorario(), resultado.getHorario());
        assertEquals(10, resultado.getCupoTotal());
        assertEquals(1, resultado.getCuposOcupados());
        assertEquals(9, resultado.getCuposDisponibles());
        assertFalse(resultado.getDisponible());
        assertFalse(resultado.getPuedeReservar());
        
        verify(claseRepository, times(1)).findById(idClaseInactiva);
    }

    @Test
    void verificarDisponibilidad_sinCupos_shouldDisponibleFalse() {
        // Given
        Long idClaseSinCupos = 3L;
        when(claseRepository.findById(idClaseSinCupos)).thenReturn(Optional.of(claseSinCupos));

        // When
        DisponibilidadDTO resultado = disponibilidadService.verificarDisponibilidad(idClaseSinCupos);

        // Then
        assertNotNull(resultado);
        assertEquals(idClaseSinCupos, resultado.getIdClase());
        assertEquals("Spinning", resultado.getNombreClase());
        assertEquals(claseSinCupos.getHorario(), resultado.getHorario());
        assertEquals(1, resultado.getCupoTotal());
        assertEquals(1, resultado.getCuposOcupados());
        assertEquals(0, resultado.getCuposDisponibles());
        assertFalse(resultado.getDisponible());
        assertFalse(resultado.getPuedeReservar());
        
        verify(claseRepository, times(1)).findById(idClaseSinCupos);
    }

    @Test
    void verificarDisponibilidad_horarioMenosDe2Horas_shouldPuedeReservarFalse() {
        // Given
        Long idClaseHorarioCercano = 4L;
        when(claseRepository.findById(idClaseHorarioCercano)).thenReturn(Optional.of(claseHorarioCercano));

        // When
        DisponibilidadDTO resultado = disponibilidadService.verificarDisponibilidad(idClaseHorarioCercano);

        // Then
        assertNotNull(resultado);
        assertEquals(idClaseHorarioCercano, resultado.getIdClase());
        assertEquals("Crossfit", resultado.getNombreClase());
        assertEquals(claseHorarioCercano.getHorario(), resultado.getHorario());
        assertEquals(10, resultado.getCupoTotal());
        assertEquals(1, resultado.getCuposOcupados());
        assertEquals(9, resultado.getCuposDisponibles());
        assertTrue(resultado.getDisponible());
        assertFalse(resultado.getPuedeReservar());
        
        verify(claseRepository, times(1)).findById(idClaseHorarioCercano);
    }

    @Test
    void verificarDisponibilidad_horarioMasDe2Horas_andDisponible_shouldPuedeReservarTrue() {
        // Given
        Long idClaseHorarioLejano = 5L;
        when(claseRepository.findById(idClaseHorarioLejano)).thenReturn(Optional.of(claseHorarioLejano));

        // When
        DisponibilidadDTO resultado = disponibilidadService.verificarDisponibilidad(idClaseHorarioLejano);

        // Then
        assertNotNull(resultado);
        assertEquals(idClaseHorarioLejano, resultado.getIdClase());
        assertEquals("Zumba", resultado.getNombreClase());
        assertEquals(claseHorarioLejano.getHorario(), resultado.getHorario());
        assertEquals(10, resultado.getCupoTotal());
        assertEquals(1, resultado.getCuposOcupados());
        assertEquals(9, resultado.getCuposDisponibles());
        assertTrue(resultado.getDisponible());
        assertTrue(resultado.getPuedeReservar());
        
        verify(claseRepository, times(1)).findById(idClaseHorarioLejano);
    }
}
