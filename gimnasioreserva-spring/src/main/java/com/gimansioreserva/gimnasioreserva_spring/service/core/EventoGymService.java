package com.gimansioreserva.gimnasioreserva_spring.service.core;

import com.gimansioreserva.gimnasioreserva_spring.domain.EventoGym;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class EventoGymService {
    /**
     * Sinks.Many actúa como un Publisher dinámico
     * multicast  -> múltiples Subscribers
     * backpressure -> manejo de presión
     */
    private final Sinks.Many<EventoGym> publisher =
            Sinks.many()
                    .multicast()
                    .onBackpressureBuffer();

    /**
     * onNext: emite un evento al flujo
     */
    public void emitirEvento(EventoGym evento) {
        publisher.tryEmitNext(evento);
    }

    /**
     * subscribe(): expone el flujo a los Subscribers
     */
    public Flux<EventoGym> flujoEventos() {
        return publisher.asFlux()

                // doOnSubscribe = onSubscribe
                .doOnSubscribe(sub ->
                        System.out.println("onSubscribe: Nuevo suscriptor conectado"))

                // doOnNext = onNext
                .doOnNext(evento ->
                        System.out.println("onNext: Evento emitido -> " + evento.getTipo()))

                // doOnError: Registra errores sin terminar el flujo.
                .doOnError(error -> {
                    System.err.println("ERROR (Publisher): " + error.getMessage());
                    // Aquí puedes añadir lógica de reintento o manejo de errores específicos
                    // Pero no completamos el Flux con empty, permitimos que intente continuar.
                })

                // doOnCancel = cancelación del subscriber
                .doOnCancel(() ->
                        System.out.println("onCancel: Suscriptor desconectado"));
    }
}
