package com.gimansioreserva.gimnasioreserva_spring.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordEncoderUtil {

    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Por favor, proporciona una contraseña como argumento.");
            return;
        }
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode(args[0]);
        System.out.println("Contraseña encriptada: " + hashedPassword);
    }
}
