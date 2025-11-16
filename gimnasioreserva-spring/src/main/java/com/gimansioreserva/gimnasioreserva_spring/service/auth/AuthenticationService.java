package com.gimansioreserva.gimnasioreserva_spring.service.auth;

import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.dto.auth.LoginRequest;
import com.gimansioreserva.gimnasioreserva_spring.dto.auth.LoginResponse;
import com.gimansioreserva.gimnasioreserva_spring.dto.auth.RegistroRequest;
import com.gimansioreserva.gimnasioreserva_spring.repository.UsuarioRepository;
import com.gimansioreserva.gimnasioreserva_spring.security.jwt.JwtTokenBlacklist;
import com.gimansioreserva.gimnasioreserva_spring.security.jwt.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtTokenBlacklist jwtTokenBlacklist;

    public AuthenticationService(AuthenticationManager authenticationManager,
                                 UsuarioRepository usuarioRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtTokenProvider jwtTokenProvider,
                                 JwtTokenBlacklist jwtTokenBlacklist) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtTokenBlacklist = jwtTokenBlacklist;
    }

    public LoginResponse login(LoginRequest request) {
        var authToken = new UsernamePasswordAuthenticationToken(
                request.getCorreo(),
                request.getContrasena()
        );

        authenticationManager.authenticate(authToken);

        Usuario usuario = usuarioRepository
                .findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String accessToken = jwtTokenProvider.generarToken(usuario.getCorreo(), usuario.getRol());
        String refreshToken = jwtTokenProvider.generarRefreshToken(usuario.getCorreo());

        return new LoginResponse(
                accessToken,
                refreshToken,
                usuario.getCorreo(),
                usuario.getNombre(),
                usuario.getRol()
        );
    }

    public Usuario registrar(RegistroRequest request) {
        if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());
        usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        usuario.setRol("USER");
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    public void logout(String token) {
        jwtTokenBlacklist.agregar(token);
    }
}
