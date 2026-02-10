package com.gimansioreserva.gimnasioreserva_spring;

import com.gimansioreserva.gimnasioreserva_spring.mapper.ReservaMapper;
import com.gimansioreserva.gimnasioreserva_spring.repository.ClaseRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.ReservaRepository;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import com.gimansioreserva.gimnasioreserva_spring.service.core.EventoGymService;
import com.gimansioreserva.gimnasioreserva_spring.service.core.ReservaService;
import com.gimansioreserva.gimnasioreserva_spring.validator.ReservaValidator;
import org.junit.jupiter.api.BeforeEach;

import static org.mockito.Mockito.mock;

public class ReservaServiceTest {
    private ReservaRepository reservaRepository;
    private ClaseRepository claseRepository;
    private UsuarioRepository usuarioRepository;
    private ReservaMapper reservaMapper;
    private ReservaValidator reservaValidator;
    private EventoGymService eventoGymService;

    private ReservaService reservaService;

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
}
