package com.gimansioreserva.gimnasioreserva_spring.util;

import com.gimansioreserva.gimnasioreserva_spring.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.LocalTime;

public class TestDataBuilder {

    private final PasswordEncoder passwordEncoder;

    public TestDataBuilder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // ========== Usuario Builders ==========

    public Usuario buildUsuario() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Usuario Test");
        usuario.setCorreo("usuario@test.com");
        usuario.setContrasena(passwordEncoder.encode("password123"));
        usuario.setRol("USER");
        usuario.setActivo(true);
        return usuario;
    }

    public Usuario buildUsuario(String nombre, String correo, String rol) {
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setCorreo(correo);
        usuario.setContrasena(passwordEncoder.encode("password123"));
        usuario.setRol(rol);
        usuario.setActivo(true);
        return usuario;
    }

    public Usuario buildAdminUsuario() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Admin Test");
        usuario.setCorreo("admin@test.com");
        usuario.setContrasena(passwordEncoder.encode("password123"));
        usuario.setRol("ADMIN");
        usuario.setActivo(true);
        return usuario;
    }

    // ========== Entrenador Builders ==========

    public Entrenador buildEntrenador() {
        Entrenador entrenador = new Entrenador();
        entrenador.setNombre("Entrenador Test");
        entrenador.setEspecialidad("Fuerza");
        entrenador.setCertificaciones("Certificado ISSA");
        entrenador.setActivo(true);
        return entrenador;
    }

    public Entrenador buildEntrenador(String nombre, String especialidad) {
        Entrenador entrenador = new Entrenador();
        entrenador.setNombre(nombre);
        entrenador.setEspecialidad(especialidad);
        entrenador.setActivo(true);
        return entrenador;
    }

    // ========== Clase Builders ==========

    public Clase buildClase(Entrenador entrenador) {
        Clase clase = new Clase();
        clase.setNombre("Clase Test");
        clase.setDescripcion("Descripción de la clase test");
        clase.setHorario(LocalDateTime.now().plusDays(1));
        clase.setCupo(20);
        clase.setDuracionMinutos(60);
        clase.setActivo(true);
        clase.setEntrenador(entrenador);
        return clase;
    }

    public Clase buildClase(String nombre, LocalDateTime horario, Integer cupo, Entrenador entrenador) {
        Clase clase = new Clase();
        clase.setNombre(nombre);
        clase.setHorario(horario);
        clase.setCupo(cupo);
        clase.setDuracionMinutos(60);
        clase.setActivo(true);
        clase.setEntrenador(entrenador);
        return clase;
    }

    // ========== Reserva Builders ==========

    public Reserva buildReserva(Usuario usuario, Clase clase) {
        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setClase(clase);
        reserva.setFechaReserva(LocalDateTime.now());
        reserva.setEstado("CONFIRMADA");
        return reserva;
    }

    public Reserva buildReserva(Usuario usuario, Clase clase, String estado) {
        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setClase(clase);
        reserva.setFechaReserva(LocalDateTime.now());
        reserva.setEstado(estado);
        return reserva;
    }

    // ========== Helper Methods ==========

    public static LocalDateTime fechaProxima() {
        return LocalDateTime.now().plusDays(1);
    }

    public static LocalDateTime fechaPasada() {
        return LocalDateTime.now().minusDays(1);
    }

    public static LocalDateTime fechaEnHoras(int horas) {
        return LocalDateTime.now().plusHours(horas);
    }
}

