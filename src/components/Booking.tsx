"use client";

import { useState } from "react";

const whatsappNumber = "50662964881";

const services = [
  "Corte y estilismo",
  "Coloración profesional",
  "Barbería premium",
  "Tratamiento capilar",
  "Uñas y estética",
  "Spa y bienestar",
];

export default function Booking() {
  const [service, setService] = useState(services[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");

  function sendBooking() {
    const message = `Hola, quiero reservar una cita en Zenit.

Nombre: ${name || "No indicado"}
Servicio: ${service}
Fecha: ${date || "No indicada"}
Hora: ${time || "No indicada"}

Quedo atento/a para confirmar disponibilidad.`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }

  const quoteMessage =
    "Hola, quiero solicitar una cotización en Zenit. Me gustaría recibir información sobre un servicio.";

  return (
    <section id="reservas" className="bg-[#0d0d0d] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#d4af37]">
          Reservas y cotizaciones
        </p>

        <h2 className="mt-4 max-w-4xl text-4xl font-black md:text-6xl">
          Elegí cómo querés iniciar tu experiencia.
        </h2>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-[#d4af37]/30 bg-[#111111] p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Opción 1
            </p>

            <h3 className="mt-4 text-3xl font-black">Reservar una cita</h3>

            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Nombre
                </label>

                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Servicio
                </label>

                <select
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-[#d4af37]"
                >
                  {services.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Fecha
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Hora
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={sendBooking}
              className="mt-8 w-full rounded-full bg-[#d4af37] px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white"
            >
              Enviar reserva por WhatsApp
            </button>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 transition hover:border-[#d4af37]/50">
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Opción 2
            </p>

            <h3 className="mt-4 text-3xl font-black">Solicitar cotización</h3>

            <p className="mt-5 text-white/65">
              Ideal para cambios de look, paquetes para eventos o servicios
              personalizados.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                quoteMessage
              )}`}
              target="_blank"
              className="mt-10 inline-flex rounded-full border border-[#d4af37]/50 px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              Cotizar por WhatsApp
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}