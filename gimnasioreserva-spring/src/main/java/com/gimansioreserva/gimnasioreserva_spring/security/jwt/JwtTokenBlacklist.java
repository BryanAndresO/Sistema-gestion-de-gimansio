package com.gimansioreserva.gimnasioreserva_spring.security.jwt;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class JwtTokenBlacklist {

    private final Set<String> blacklist = new HashSet<>();

    public void agregar(String token) {
        blacklist.add(token);
    }

    public boolean estaBlacklisted(String token) {
        return blacklist.contains(token);
    }
}
