package com.gimansioreserva.gimnasioreserva_spring.web.controller;

import com.gimansioreserva.gimnasioreserva_spring.domain.Usuario;
import com.gimansioreserva.gimnasioreserva_spring.dto.auth.LoginRequest;
import com.gimansioreserva.gimnasioreserva_spring.dto.auth.LoginResponse;
import com.gimansioreserva.gimnasioreserva_spring.dto.auth.PasswordResetRequest;
import com.gimansioreserva.gimnasioreserva_spring.dto.auth.RegistroRequest;
import com.gimansioreserva.gimnasioreserva_spring.service.auth.AuthenticationService;
import com.gimansioreserva.gimnasioreserva_spring.service.auth.PasswordResetService;
import com.gimansioreserva.gimnasioreserva_spring.util.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthenticationService authenticationService,
                         PasswordResetService passwordResetService) {
        this.authenticationService = authenticationService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authenticationService.login(request);
            return ResponseUtil.success(response, "Inicio de sesión exitoso");
        } catch (RuntimeException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return ResponseUtil.error("Error al iniciar sesión: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistroRequest request) {
        try {
            Usuario usuario = authenticationService.registrar(request);
            return ResponseUtil.created(usuario, "Usuario registrado exitosamente");
        } catch (RuntimeException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Error al registrar usuario: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                authenticationService.logout(token);
            }
            return ResponseUtil.success("Sesión cerrada exitosamente");
        } catch (Exception e) {
            return ResponseUtil.error("Error al cerrar sesión: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            passwordResetService.resetPassword(request);
            return ResponseUtil.success("Contraseña restablecida exitosamente");
        } catch (RuntimeException e) {
            return ResponseUtil.error(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return ResponseUtil.error("Error al restablecer contraseña: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

