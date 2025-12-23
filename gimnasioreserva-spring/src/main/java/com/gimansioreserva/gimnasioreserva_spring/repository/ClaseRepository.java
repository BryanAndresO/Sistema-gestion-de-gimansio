package com.gimansioreserva.gimnasioreserva_spring.repository;

import com.gimansioreserva.gimnasioreserva_spring.domain.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaseRepository extends JpaRepository<Clase, Long> {

    // Buscar clases activas
    List<Clase> findByActivo(Boolean activo);

    // Buscar clases por entrenador
    List<Clase> findByEntrenador_IdEntrenador(Long idEntrenador);

    // Buscar clases por entrenador y activas
    List<Clase> findByEntrenador_IdEntrenadorAndActivo(Long idEntrenador, Boolean activo);

    // Buscar clases por nombre (búsqueda parcial)
    @Query("SELECT c FROM Clase c WHERE LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Clase> buscarPorNombre(@Param("nombre") String nombre);

    // Buscar clases disponibles (con cupos)
    @Query("SELECT c FROM Clase c WHERE c.activo = true AND SIZE(c.reservas) < c.cupo")
    List<Clase> obtenerClasesDisponibles();

    // Buscar clases por rango de fechas
    @Query("SELECT c FROM Clase c WHERE c.horario BETWEEN :fechaInicio AND :fechaFin AND c.activo = true")
    List<Clase> buscarPorRangoFechas(@Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    // Obtener clases próximas
    @Query("SELECT c FROM Clase c WHERE c.horario > :ahora AND c.activo = true ORDER BY c.horario ASC")
    List<Clase> obtenerClasesProximas(@Param("ahora") LocalDateTime ahora);

    // Contar reservas por clase
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.clase.idClase = :idClase AND r.estado = 'CONFIRMADA'")
    Long contarReservasConfirmadas(@Param("idClase") Long idClase);

    // Clases con cupos agotados
    @Query("SELECT c FROM Clase c WHERE SIZE(c.reservas) >= c.cupo AND c.activo = true")
    List<Clase> obtenerClasesConCuposAgotados();

    // Buscar clase por identificador (String)
    Optional<Clase> findByClaseId(String claseId);
}