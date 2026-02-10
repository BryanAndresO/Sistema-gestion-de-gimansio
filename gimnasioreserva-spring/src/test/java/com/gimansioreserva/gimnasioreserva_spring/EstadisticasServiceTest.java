package com.gimansioreserva.gimnasioreserva_spring;

import com.gimansioreserva.gimnasioreserva_spring.domain.Reserva;
import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.EstadisticaDTO;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.ReservaRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EstadisticasService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para EstadisticasService.
 * Persona 3 (Andres): métricas y agregaciones.
 */
public class EstadisticasServiceTest {

    private ClaseRepository claseRepository;
    private ReservaRepository reservaRepository;
    private UsuarioRepository usuarioRepository;

    private EstadisticasService estadisticasService;

    @BeforeEach
    void setup() {
        claseRepository = mock(ClaseRepository.class);
        reservaRepository = mock(ReservaRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);

        estadisticasService = new EstadisticasService(
                claseRepository,
                reservaRepository,
                usuarioRepository);
    }

    // =========================================================
    // obtenerEstadisticasGenerales()
    // =========================================================

    @Test
    void obtenerEstadisticasGenerales_shouldFillTotals() {
        // Arrange
        when(claseRepository.count()).thenReturn(10L);
        when(reservaRepository.count()).thenReturn(50L);
        when(reservaRepository.contarPorEstado("CONFIRMADA")).thenReturn(20L);
        when(reservaRepository.contarPorEstado("CANCELADA")).thenReturn(15L);
        when(reservaRepository.contarPorEstado("COMPLETADA")).thenReturn(15L);

        // 3 usuarios activos
        Usuario u1 = new Usuario();
        Usuario u2 = new Usuario();
        Usuario u3 = new Usuario();
        when(usuarioRepository.findByActivo(true)).thenReturn(List.of(u1, u2, u3));

        // Sin datos de clase ni rango (para aislar este test)
        when(reservaRepository.obtenerEstadisticasPorClase()).thenReturn(Collections.emptyList());
        when(reservaRepository.buscarPorRangoFechas(any(), any())).thenReturn(Collections.emptyList());

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasGenerales();

        // Assert
        assertEquals(10L, result.getTotalClases());
        assertEquals(50L, result.getTotalReservas());
        assertEquals(20L, result.getReservasConfirmadas());
        assertEquals(15L, result.getReservasCanceladas());
        assertEquals(15L, result.getReservasCompletadas());
        assertEquals(3L, result.getUsuariosActivos());

        // Verificar que se llamaron los repositorios
        verify(claseRepository).count();
        verify(reservaRepository).count();
        verify(reservaRepository).contarPorEstado("CONFIRMADA");
        verify(reservaRepository).contarPorEstado("CANCELADA");
        verify(reservaRepository).contarPorEstado("COMPLETADA");
        verify(usuarioRepository).findByActivo(true);
    }

    @Test
    void obtenerEstadisticasGenerales_shouldBuildReservasPorClaseMap() {
        // Arrange — preparar datos mínimos para totales
        when(claseRepository.count()).thenReturn(3L);
        when(reservaRepository.count()).thenReturn(25L);
        when(reservaRepository.contarPorEstado(anyString())).thenReturn(0L);
        when(usuarioRepository.findByActivo(true)).thenReturn(Collections.emptyList());
        when(reservaRepository.buscarPorRangoFechas(any(), any())).thenReturn(Collections.emptyList());

        // Lo que realmente probamos: estadísticas por clase
        List<Object[]> statsPorClase = List.of(
                new Object[] { "Yoga", 10L },
                new Object[] { "Spinning", 8L },
                new Object[] { "CrossFit", 7L });
        when(reservaRepository.obtenerEstadisticasPorClase()).thenReturn(statsPorClase);

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasGenerales();

        // Assert
        Map<String, Long> reservasPorClase = result.getReservasPorClase();
        assertNotNull(reservasPorClase);
        assertEquals(3, reservasPorClase.size());
        assertEquals(10L, reservasPorClase.get("Yoga"));
        assertEquals(8L, reservasPorClase.get("Spinning"));
        assertEquals(7L, reservasPorClase.get("CrossFit"));

        verify(reservaRepository).obtenerEstadisticasPorClase();
    }

    @Test
    void obtenerEstadisticasGenerales_shouldBuildReservasPorMesMap() {
        // Arrange — preparar datos mínimos para totales
        when(claseRepository.count()).thenReturn(0L);
        when(reservaRepository.count()).thenReturn(0L);
        when(reservaRepository.contarPorEstado(anyString())).thenReturn(0L);
        when(usuarioRepository.findByActivo(true)).thenReturn(Collections.emptyList());
        when(reservaRepository.obtenerEstadisticasPorClase()).thenReturn(Collections.emptyList());

        // Lo que realmente probamos: agrupación por mes
        // Crear reservas en distintos meses
        Reserva r1 = new Reserva();
        r1.setFechaReserva(LocalDateTime.of(2026, 1, 15, 10, 0));
        r1.setEstado("CONFIRMADA");

        Reserva r2 = new Reserva();
        r2.setFechaReserva(LocalDateTime.of(2026, 1, 20, 14, 0));
        r2.setEstado("CANCELADA");

        Reserva r3 = new Reserva();
        r3.setFechaReserva(LocalDateTime.of(2026, 2, 5, 9, 0));
        r3.setEstado("COMPLETADA");

        when(reservaRepository.buscarPorRangoFechas(any(), any()))
                .thenReturn(List.of(r1, r2, r3));

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasGenerales();

        // Assert
        Map<String, Long> reservasPorMes = result.getReservasPorMes();
        assertNotNull(reservasPorMes);
        assertEquals(2, reservasPorMes.size()); // 2 meses distintos
        assertEquals(2L, reservasPorMes.get("2026-01")); // enero: r1 + r2
        assertEquals(1L, reservasPorMes.get("2026-02")); // febrero: r3

        verify(reservaRepository).buscarPorRangoFechas(any(), any());
    }

    @Test
    void obtenerEstadisticasGenerales_whenNoData_shouldReturnZerosAndEmptyMaps() {
        // Arrange — todo vacío / cero
        when(claseRepository.count()).thenReturn(0L);
        when(reservaRepository.count()).thenReturn(0L);
        when(reservaRepository.contarPorEstado(anyString())).thenReturn(0L);
        when(usuarioRepository.findByActivo(true)).thenReturn(Collections.emptyList());
        when(reservaRepository.obtenerEstadisticasPorClase()).thenReturn(Collections.emptyList());
        when(reservaRepository.buscarPorRangoFechas(any(), any())).thenReturn(Collections.emptyList());

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasGenerales();

        // Assert
        assertEquals(0L, result.getTotalClases());
        assertEquals(0L, result.getTotalReservas());
        assertEquals(0L, result.getReservasConfirmadas());
        assertEquals(0L, result.getReservasCanceladas());
        assertEquals(0L, result.getReservasCompletadas());
        assertEquals(0L, result.getUsuariosActivos());

        assertNotNull(result.getReservasPorClase());
        assertTrue(result.getReservasPorClase().isEmpty());

        assertNotNull(result.getReservasPorMes());
        assertTrue(result.getReservasPorMes().isEmpty());
    }

    // =========================================================
    // obtenerEstadisticasPorPeriodo(inicio, fin)
    // =========================================================

    @Test
    void obtenerEstadisticasPorPeriodo_shouldCountEstadosCorrectly() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 1, 31, 23, 59);

        Reserva r1 = new Reserva();
        r1.setEstado("CONFIRMADA");
        Reserva r2 = new Reserva();
        r2.setEstado("CONFIRMADA");
        Reserva r3 = new Reserva();
        r3.setEstado("CANCELADA");
        Reserva r4 = new Reserva();
        r4.setEstado("COMPLETADA");
        Reserva r5 = new Reserva();
        r5.setEstado("COMPLETADA");
        Reserva r6 = new Reserva();
        r6.setEstado("COMPLETADA");

        when(reservaRepository.buscarPorRangoFechas(inicio, fin))
                .thenReturn(List.of(r1, r2, r3, r4, r5, r6));

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasPorPeriodo(inicio, fin);

        // Assert
        assertEquals(6L, result.getTotalReservas());
        assertEquals(2L, result.getReservasConfirmadas());
        assertEquals(1L, result.getReservasCanceladas());
        assertEquals(3L, result.getReservasCompletadas());

        verify(reservaRepository).buscarPorRangoFechas(inicio, fin);
    }

    @Test
    void obtenerEstadisticasPorPeriodo_whenEmpty_shouldReturnZeros() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.of(2026, 6, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 6, 30, 23, 59);

        when(reservaRepository.buscarPorRangoFechas(inicio, fin))
                .thenReturn(Collections.emptyList());

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasPorPeriodo(inicio, fin);

        // Assert
        assertEquals(0L, result.getTotalReservas());
        assertEquals(0L, result.getReservasConfirmadas());
        assertEquals(0L, result.getReservasCanceladas());
        assertEquals(0L, result.getReservasCompletadas());
    }

    @Test
    void obtenerEstadisticasPorPeriodo_withSingleEstado_shouldCountOnlyThatEstado() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.of(2026, 3, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 3, 31, 23, 59);

        Reserva r1 = new Reserva();
        r1.setEstado("CANCELADA");
        Reserva r2 = new Reserva();
        r2.setEstado("CANCELADA");

        when(reservaRepository.buscarPorRangoFechas(inicio, fin))
                .thenReturn(List.of(r1, r2));

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasPorPeriodo(inicio, fin);

        // Assert
        assertEquals(2L, result.getTotalReservas());
        assertEquals(0L, result.getReservasConfirmadas());
        assertEquals(2L, result.getReservasCanceladas());
        assertEquals(0L, result.getReservasCompletadas());
    }

    @Test
    void obtenerEstadisticasPorPeriodo_shouldSetTotalReservasAsListSize() {
        // Arrange
        LocalDateTime inicio = LocalDateTime.of(2026, 2, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 2, 28, 23, 59);

        Reserva r1 = new Reserva();
        r1.setEstado("CONFIRMADA");
        Reserva r2 = new Reserva();
        r2.setEstado("CONFIRMADA");
        Reserva r3 = new Reserva();
        r3.setEstado("CONFIRMADA");
        Reserva r4 = new Reserva();
        r4.setEstado("CANCELADA");

        List<Reserva> reservas = List.of(r1, r2, r3, r4);
        when(reservaRepository.buscarPorRangoFechas(inicio, fin))
                .thenReturn(reservas);

        // Act
        EstadisticaDTO result = estadisticasService.obtenerEstadisticasPorPeriodo(inicio, fin);

        // Assert — totalReservas debe ser el tamaño de la lista
        assertEquals((long) reservas.size(), result.getTotalReservas());
        assertEquals(4L, result.getTotalReservas());
    }
}
