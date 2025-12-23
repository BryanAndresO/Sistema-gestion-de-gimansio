package com.gimansioreserva.gimnasioreserva_spring.security.jwt;

import com.gimansioreserva.gimnasioreserva_spring.service.auth.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtTokenBlacklist jwtTokenBlacklist;
    private final UserDetailsServiceImpl userDetailsService;

    // Lista de URLs que no requieren autenticación JWT
    private static final List<String> EXCLUDED_URLS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/password-reset",
            "/api/recomendaciones/stream",
            "/api/recomendaciones/simular",
            "/swagger-ui/index.html",
            "/swagger-ui/**",
            "/v3/api-docs/**"
    );

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   JwtTokenBlacklist jwtTokenBlacklist,
                                   UserDetailsServiceImpl userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtTokenBlacklist = jwtTokenBlacklist;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Si la URL es una de las excluidas, no procesamos el JWT y pasamos al siguiente filtro.
        String requestURI = request.getRequestURI();
        if (EXCLUDED_URLS.stream().anyMatch(url -> requestURI.equals(url) || requestURI.startsWith(url))) {
            System.out.println("URL excluida de autenticación JWT: " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;

        // Intentar obtener el token del header Authorization (método estándar)
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }
        
        // Si no hay token en el header, intentar obtenerlo de query parameters
        // Esto es necesario para SSE (Server-Sent Events) ya que EventSource no soporta headers personalizados
        if (token == null) {
            token = request.getParameter("token");
        }

        if (token != null && !jwtTokenBlacklist.estaBlacklisted(token) && jwtTokenProvider.validarToken(token)) {
            String correo = jwtTokenProvider.obtenerCorreoDelToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(correo);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
