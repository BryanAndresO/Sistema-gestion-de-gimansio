package com.gimansioreserva.gimnasioreserva_spring.integration;

import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AuthenticationIntegrationTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setNombre("Integration Test User");
        usuario.setCorreo("integration@test.com");
        usuario.setContrasena(passwordEncoder.encode("password123"));
        usuario.setRol("USER");
        usuario.setActivo(true);
        usuario = entityManager.persistAndFlush(usuario);
    }

    @Test
    void testUsuarioRepository_SaveAndFind() {
        Usuario newUsuario = new Usuario();
        newUsuario.setNombre("New User");
        newUsuario.setCorreo("new@test.com");
        newUsuario.setContrasena(passwordEncoder.encode("password123"));
        newUsuario.setRol("USER");
        newUsuario.setActivo(true);

        Usuario saved = usuarioRepository.save(newUsuario);

        Optional<Usuario> found = usuarioRepository.findByCorreo("new@test.com");
        assertThat(found).isPresent();
        assertThat(found.get().getCorreo()).isEqualTo("new@test.com");
    }

    @Test
    void testUsuarioRepository_FindByCorreo() {
        Optional<Usuario> found = usuarioRepository.findByCorreo("integration@test.com");

        assertThat(found).isPresent();
        assertThat(found.get().getNombre()).isEqualTo("Integration Test User");
    }
}
