package com.gimansioreserva.gimnasioreserva_spring.dto.auth;

public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private Long idUsuario;
    private String correo;
    private String nombre;
    private String rol;

    // Constructores
    public LoginResponse() {}

    public LoginResponse(String accessToken, String refreshToken, Long idUsuario, String correo, String nombre, String rol) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.idUsuario = idUsuario;
        this.correo = correo;
        this.nombre = nombre;
        this.rol = rol;
    }

    // Getters y Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
}

