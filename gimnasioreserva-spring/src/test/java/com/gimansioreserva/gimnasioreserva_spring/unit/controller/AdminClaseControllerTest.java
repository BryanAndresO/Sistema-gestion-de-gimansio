package com.gimansioreserva.gimnasioreserva_spring.unit.controller;

import com.gimansioreserva.gimnasioreserva_spring.dto.admin.ClaseAdminDTO;
import com.gimansioreserva.gimnasioreserva_spring.service.admin.AdminClaseService;
import com.gimansioreserva.gimnasioreserva_spring.web.controller.admin.AdminClaseController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminClaseControllerTest {

    @Mock
    private AdminClaseService adminClaseService;

    @InjectMocks
    private AdminClaseController adminClaseController;

    private ClaseAdminDTO claseDTO;

    @BeforeEach
    void setUp() {
        claseDTO = new ClaseAdminDTO();
        claseDTO.setIdClase(1L);
        claseDTO.setNombre("Clase Test");
        claseDTO.setHorario(LocalDateTime.now().plusDays(1));
        claseDTO.setCupo(20);
    }

    @Test
    void testListarTodas() {
        List<ClaseAdminDTO> clases = Arrays.asList(claseDTO);
        when(adminClaseService.listarTodas()).thenReturn(clases);

        ResponseEntity<List<ClaseAdminDTO>> response = adminClaseController.listarTodas();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        verify(adminClaseService, times(1)).listarTodas();
    }

    @Test
    void testBuscarPorId_Success() {
        when(adminClaseService.buscarPorId(1L)).thenReturn(Optional.of(claseDTO));

        ResponseEntity<ClaseAdminDTO> response = adminClaseController.buscarPorId(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getIdClase()).isEqualTo(1L);
    }

    @Test
    void testBuscarPorId_NotFound() {
        when(adminClaseService.buscarPorId(1L)).thenReturn(Optional.empty());

        ResponseEntity<ClaseAdminDTO> response = adminClaseController.buscarPorId(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void testCrear_Success() {
        when(adminClaseService.crear(claseDTO)).thenReturn(Optional.of(claseDTO));

        ResponseEntity<?> response = adminClaseController.crear(claseDTO);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
    }
}
