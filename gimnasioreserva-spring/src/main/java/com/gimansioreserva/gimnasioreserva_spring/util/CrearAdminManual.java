package com.gimansioreserva.gimnasioreserva_spring.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Utilidad para crear usuarios admin manualmente.
 * Ejecuta este programa para generar el SQL necesario para insertar un admin.
 */
public class CrearAdminManual {

    public static void main(String[] args) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        // Generar hash para la contraseña "admin123"
        String password = "admin123";
        String hashedPassword = passwordEncoder.encode(password);

        System.out.println("=".repeat(80));
        System.out.println("CREAR USUARIO ADMIN MANUALMENTE");
        System.out.println("=".repeat(80));
        System.out.println();
        System.out.println("Ejecuta este SQL en tu base de datos MySQL:");
        System.out.println();
        System.out.println("INSERT INTO usuarios (nombre, correo, contrasena, rol, activo)");
        System.out.println("VALUES ('Administrador', 'admin@gimnasio.com', '" + hashedPassword + "', 'ADMIN', true);");
        System.out.println();
        System.out.println("O si ya existe, actualiza la contraseña:");
        System.out.println();
        System.out.println("UPDATE usuarios");
        System.out.println("SET contrasena = '" + hashedPassword + "', rol = 'ADMIN'");
        System.out.println("WHERE correo = 'admin@gimnasio.com';");
        System.out.println();
        System.out.println("Credenciales:");
        System.out.println("  Correo: admin@gimnasio.com");
        System.out.println("  Contraseña: " + password);
        System.out.println("=".repeat(80));
    }
}
