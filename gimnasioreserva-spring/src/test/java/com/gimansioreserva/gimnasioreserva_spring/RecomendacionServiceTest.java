package com.gimansioreserva.gimnasioreserva_spring;

import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import com.gimansioreserva.gimnasioreserva_spring.domain.TipoEvento;
import com.gimansioreserva.gimnasioreserva_spring.dto.core.RecomendacionDTO;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.service.core.RecomendacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para RecomendacionService.
 * Pruebas reactivas utilizando StepVerifier para validar el comportamiento del pipeline reactivo.
 */
public class RecomendacionServiceTest {

    private ClaseRepository claseRepository;
    private RecomendacionService recomendacionService;

    @BeforeEach
    void setup() {
        claseRepository = mock(ClaseRepository.class);
        recomendacionService = new RecomendacionService(claseRepository);
    }

    // =========================================================
    // generar(Flux<EventoGym> eventos)
    // =========================================================

    @Test
    void generar_shouldFilterOnlyRelevantEvents() {
        // Arrange
        EventoGym eventoRelevante1 = new EventoGym("1", TipoEvento.CUPO_DISPONIBLE);
        EventoGym eventoRelevante2 = new EventoGym("2", TipoEvento.CLASE_LLENA);
        EventoGym eventoRelevante3 = new EventoGym("3", TipoEvento.CAMBIO_HORARIO);
        EventoGym eventoRelevante4 = new EventoGym("4", TipoEvento.RESERVA_CREADA);
        EventoGym eventoRelevante5 = new EventoGym("5", TipoEvento.RESERVA_CANCELADA);
        
        // Eventos no relevantes (no deberían procesarse)
        // Nota: No hay otros tipos de eventos en el enum, pero el test valida el filtro

        Clase clase1 = new Clase();
        clase1.setIdClase(1L);
        clase1.setNombre("Yoga Matutino");
        
        Clase clase2 = new Clase();
        clase2.setIdClase(2L);
        clase2.setNombre("Spinning Intensivo");
        
        Clase clase3 = new Clase();
        clase3.setIdClase(3L);
        clase3.setNombre("CrossFit Avanzado");
        
        Clase clase4 = new Clase();
        clase4.setIdClase(4L);
        clase4.setNombre("Pilates Suave");
        
        Clase clase5 = new Clase();
        clase5.setIdClase(5L);
        clase5.setNombre("Zumba Dance");

        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase1));
        when(claseRepository.findById(2L)).thenReturn(Optional.of(clase2));
        when(claseRepository.findById(3L)).thenReturn(Optional.of(clase3));
        when(claseRepository.findById(4L)).thenReturn(Optional.of(clase4));
        when(claseRepository.findById(5L)).thenReturn(Optional.of(clase5));

        Flux<EventoGym> eventos = Flux.just(
                eventoRelevante1,
                eventoRelevante2,
                eventoRelevante3,
                eventoRelevante4,
                eventoRelevante5
        );

        // Act & Assert
        StepVerifier.create(recomendacionService.generar(eventos))
                .expectNextCount(5) // Debe procesar los 5 eventos relevantes
                .verifyComplete();

        // Verificar que se consultaron las clases
        verify(claseRepository, times(5)).findById(anyLong());
    }

    @Test
    void generar_whenClaseIdNumericAndFound_shouldEmitRecomendacionConNombreBD() {
        // Arrange
        Long idClase = 10L;
        String nombreClaseBD = "Yoga Avanzado";
        
        Clase clase = new Clase();
        clase.setIdClase(idClase);
        clase.setNombre(nombreClaseBD);

        EventoGym evento = new EventoGym("10", TipoEvento.CUPO_DISPONIBLE);
        
        when(claseRepository.findById(idClase)).thenReturn(Optional.of(clase));

        Flux<EventoGym> eventos = Flux.just(evento);

        // Act & Assert
        StepVerifier.create(recomendacionService.generar(eventos))
                .assertNext(recomendacion -> {
                    assertEquals("10", recomendacion.getClaseId());
                    assertEquals(nombreClaseBD, recomendacion.getNombreClase());
                    assertNotNull(recomendacion.getMensaje());
                    assertTrue(recomendacion.getMensaje().contains(nombreClaseBD));
                    assertEquals(1, recomendacion.getPrioridad()); // CUPO_DISPONIBLE tiene prioridad 1
                    assertNotNull(recomendacion.getTimestamp());
                })
                .verifyComplete();

        verify(claseRepository).findById(idClase);
    }

    @Test
    void generar_whenClaseIdNonNumeric_shouldEmitRecomendacionGenerica() {
        // Arrange
        String claseIdNoNumerico = "YOGA-101";
        EventoGym evento = new EventoGym(claseIdNoNumerico, TipoEvento.CLASE_LLENA);

        Flux<EventoGym> eventos = Flux.just(evento);

        // Act & Assert
        StepVerifier.create(recomendacionService.generar(eventos))
                .assertNext(recomendacion -> {
                    assertEquals(claseIdNoNumerico, recomendacion.getClaseId());
                    assertEquals("Yoga", recomendacion.getNombreClase()); // Debe generar nombre amigable
                    assertNotNull(recomendacion.getMensaje());
                    assertTrue(recomendacion.getMensaje().contains("Yoga"));
                    assertEquals(3, recomendacion.getPrioridad()); // CLASE_LLENA tiene prioridad 3
                    assertNotNull(recomendacion.getTimestamp());
                })
                .verifyComplete();

        // No debe buscar en BD cuando el ID no es numérico
        verify(claseRepository, never()).findById(anyLong());
    }

    @Test
    void generar_shouldDistinctByClaseId() {
        // Arrange
        Long idClase = 20L;
        String nombreClase = "Pilates Matutino";
        
        Clase clase = new Clase();
        clase.setIdClase(idClase);
        clase.setNombre(nombreClase);

        // Crear múltiples eventos con el mismo claseId
        EventoGym evento1 = new EventoGym("20", TipoEvento.CUPO_DISPONIBLE);
        EventoGym evento2 = new EventoGym("20", TipoEvento.CAMBIO_HORARIO);
        EventoGym evento3 = new EventoGym("20", TipoEvento.RESERVA_CREADA);

        when(claseRepository.findById(idClase)).thenReturn(Optional.of(clase));

        Flux<EventoGym> eventos = Flux.just(evento1, evento2, evento3);

        // Act & Assert
        // distinct() debe asegurar que solo se emita una recomendación por claseId
        StepVerifier.create(recomendacionService.generar(eventos))
                .assertNext(recomendacion -> {
                    assertEquals("20", recomendacion.getClaseId());
                    assertEquals(nombreClase, recomendacion.getNombreClase());
                })
                .verifyComplete();

        // Aunque hay 3 eventos, distinct() solo permite pasar una recomendación
        verify(claseRepository, atLeastOnce()).findById(idClase);
    }

    @Test
    void generar_shouldNotFailOnBadInput() {
        // Arrange
        // Casos de entrada problemática:
        // 1. claseId numérico pero clase no encontrada en BD
        // 2. claseId null o vacío
        // 3. Múltiples eventos con diferentes problemas

        Clase claseEncontrada = new Clase();
        claseEncontrada.setIdClase(1L);
        claseEncontrada.setNombre("Clase Encontrada");

        EventoGym eventoClaseNoEncontrada = new EventoGym("999", TipoEvento.CUPO_DISPONIBLE);
        EventoGym eventoClaseEncontrada = new EventoGym("1", TipoEvento.CAMBIO_HORARIO);
        EventoGym eventoIdNoNumerico = new EventoGym("PILATES-202", TipoEvento.RESERVA_CANCELADA);

        when(claseRepository.findById(999L)).thenReturn(Optional.empty());
        when(claseRepository.findById(1L)).thenReturn(Optional.of(claseEncontrada));

        Flux<EventoGym> eventos = Flux.just(
                eventoClaseNoEncontrada,  // Clase no encontrada -> no emite nada (Mono.empty())
                eventoClaseEncontrada,    // Clase encontrada -> emite recomendación
                eventoIdNoNumerico        // ID no numérico -> emite recomendación genérica
        );

        // Act & Assert
        // El pipeline no debe fallar, debe manejar los errores gracefully
        StepVerifier.create(recomendacionService.generar(eventos))
                .assertNext(recomendacion -> {
                    // Primera recomendación: clase encontrada
                    assertEquals("1", recomendacion.getClaseId());
                    assertEquals("Clase Encontrada", recomendacion.getNombreClase());
                })
                .assertNext(recomendacion -> {
                    // Segunda recomendación: ID no numérico (genérica)
                    assertEquals("PILATES-202", recomendacion.getClaseId());
                    assertEquals("Pilates", recomendacion.getNombreClase());
                })
                .verifyComplete();

        // Verificar que se intentaron buscar las clases numéricas
        verify(claseRepository).findById(999L);
        verify(claseRepository).findById(1L);
    }

    @Test
    void generar_whenClaseIdNumericButNotFound_shouldNotEmitRecomendacion() {
        // Arrange
        Long idClaseNoExistente = 999L;
        EventoGym evento = new EventoGym("999", TipoEvento.CUPO_DISPONIBLE);

        when(claseRepository.findById(idClaseNoExistente)).thenReturn(Optional.empty());

        Flux<EventoGym> eventos = Flux.just(evento);

        // Act & Assert
        // Cuando la clase no se encuentra, Mono.justOrEmpty() retorna Mono.empty()
        // y no emite nada en el Flux
        StepVerifier.create(recomendacionService.generar(eventos))
                .expectNextCount(0) // No debe emitir ninguna recomendación
                .verifyComplete();

        verify(claseRepository).findById(idClaseNoExistente);
    }

    @Test
    void generar_shouldHandleMultipleEventTypes() {
        // Arrange
        Clase clase = new Clase();
        clase.setIdClase(1L);
        clase.setNombre("Yoga");

        EventoGym cupoDisponible = new EventoGym("1", TipoEvento.CUPO_DISPONIBLE);
        EventoGym claseLlena = new EventoGym("2", TipoEvento.CLASE_LLENA);
        EventoGym cambioHorario = new EventoGym("3", TipoEvento.CAMBIO_HORARIO);

        Clase clase2 = new Clase();
        clase2.setIdClase(2L);
        clase2.setNombre("Spinning");

        Clase clase3 = new Clase();
        clase3.setIdClase(3L);
        clase3.setNombre("CrossFit");

        when(claseRepository.findById(1L)).thenReturn(Optional.of(clase));
        when(claseRepository.findById(2L)).thenReturn(Optional.of(clase2));
        when(claseRepository.findById(3L)).thenReturn(Optional.of(clase3));

        Flux<EventoGym> eventos = Flux.just(cupoDisponible, claseLlena, cambioHorario);

        // Act & Assert
        StepVerifier.create(recomendacionService.generar(eventos))
                .assertNext(recomendacion -> {
                    assertEquals("1", recomendacion.getClaseId());
                    assertEquals(1, recomendacion.getPrioridad()); // CUPO_DISPONIBLE
                })
                .assertNext(recomendacion -> {
                    assertEquals("2", recomendacion.getClaseId());
                    assertEquals(3, recomendacion.getPrioridad()); // CLASE_LLENA
                })
                .assertNext(recomendacion -> {
                    assertEquals("3", recomendacion.getClaseId());
                    assertEquals(2, recomendacion.getPrioridad()); // CAMBIO_HORARIO
                })
                .verifyComplete();
    }
}
