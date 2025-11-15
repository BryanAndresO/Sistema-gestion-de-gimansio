package com.gimansioreserva.gimnasioreserva_spring.service.auth;

import com.gimansioreserva.gimnasioreserva_spring.security.jwt.JwtTokenBlacklist;
import com.gimansioreserva.gimnasioreserva_spring.security.jwt.JwtTokenProvider;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtTokenBlacklist jwtTokenBlacklist;

    public TokenService(JwtTokenProvider jwtTokenProvider,
                        JwtTokenBlacklist jwtTokenBlacklist) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtTokenBlacklist = jwtTokenBlacklist;
    }

    // Generar access token
    public String generarAccessToken(String correo, String rol) {
        return jwtTokenProvider.generarToken(correo, rol);
    }

    // Generar refresh token
    public String generarRefreshToken(String correo) {
        return jwtTokenProvider.generarRefreshToken(correo);
    }

    // Validar token
    public boolean validarToken(String token) {
        if (jwtTokenBlacklist.estaBlacklisted(token)) {
            return false;
        }
        return jwtTokenProvider.validarToken(token);
    }

    // Extraer correo del token
    public String obtenerCorreo(String token) {
        return jwtTokenProvider.obtenerCorreoDelToken(token);
    }

    // Invalida un token (logout)
    public void invalidarToken(String token) {
        jwtTokenBlacklist.agregar(token);
    }
}
