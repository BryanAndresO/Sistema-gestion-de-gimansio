-- Actualizar usuario admin con contraseña correcta
UPDATE usuarios
SET contrasena = '$2a$10$J5Nc37ardDKvwEk4vCxQvOikHdY0NXvgXid2Nh3/x9X.n/QEvkvaq',
    rol = 'ADMIN',
    activo = 1
WHERE correo = 'admin@gimnasio.com';

-- Verificar el resultado
SELECT id_usuario, nombre, correo, rol, activo, LENGTH(contrasena) as longitud_hash
FROM usuarios
WHERE correo = 'admin@gimnasio.com';
