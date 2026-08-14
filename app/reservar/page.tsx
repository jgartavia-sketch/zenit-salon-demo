"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./reservar.module.css";

type ReservableService = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const WHATSAPP_NUMBER = "50671246337";

const reservableServices: ReservableService[] = [
  {
    id: "corte-recto",
    name: "Corte recto",
    price: 5000,
    category: "Cortes",
  },
  {
    id: "corte-v",
    name: "Corte en V",
    price: 5000,
    category: "Cortes",
  },
  {
    id: "corte-mariposa",
    name: "Corte mariposa",
    price: 5000,
    category: "Cortes",
  },
  {
    id: "corte-capas",
    name: "Corte en capas",
    price: 5000,
    category: "Cortes",
  },
  {
    id: "corte-pixie",
    name: "Corte pixie",
    price: 5000,
    category: "Cortes",
  },
  {
    id: "corte-bob-chanel",
    name: "Corte bob o chanel",
    price: 5000,
    category: "Cortes",
  },
  {
    id: "corte-clasico-hombre",
    name: "Corte clásico de hombre",
    price: 5000,
    category: "Cortes",
  },
  {
    id: "lavado-secado-planchado-tratamiento",
    name: "Lavado + secado + planchado + tratamiento básico",
    price: 10000,
    category: "Servicio completo",
  },
];

function formatPrice(value: number) {
  return `₡${value.toLocaleString("es-CR")}`;
}

function todayISO() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const local = new Date(today.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
}

export default function ReservarPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const servicesParam = params.get("servicios");

    if (!servicesParam) return;

    const validIds = servicesParam
      .split(",")
      .filter((id) => reservableServices.some((service) => service.id === id));

    setSelectedIds([...new Set(validIds)]);
  }, []);

  const selectedServices = useMemo(
    () =>
      reservableServices.filter((service) => selectedIds.includes(service.id)),
    [selectedIds],
  );

  const total = useMemo(
    () =>
      selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices],
  );

  const toggleService = (serviceId: string) => {
    setSelectedIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const submitReservation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedServices.length) return;

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const date = String(form.get("date") || "").trim();
    const time = String(form.get("time") || "").trim();
    const notes = String(form.get("notes") || "").trim();

    const serviceLines = selectedServices.map(
      (service) => `• ${service.name} — ${formatPrice(service.price)}`,
    );

    const message = [
      "Hola, Zénit Salón.",
      "",
      "Quiero solicitar una reserva.",
      "",
      `Nombre: ${name}`,
      `WhatsApp: ${phone}`,
      `Fecha preferida: ${date}`,
      `Hora preferida: ${time}`,
      "",
      "Servicios:",
      ...serviceLines,
      "",
      `Total de servicios: ${formatPrice(total)}`,
      "Incluye lavado, secado y planchado cuando corresponda.",
      "",
      notes ? `Notas: ${notes}` : "",
      "",
      "Entiendo que la fecha y hora quedan sujetas a confirmación de Zénit.",
    ]
      .filter(Boolean)
      .join("\n");

    setSubmitted(true);

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className={styles.page}>
      <header className="site-header">
        <Link
          className="brand"
          href="/"
          aria-label="Zénit Salón, inicio"
          onClick={() => setMenuOpen(false)}
        >
          <img src="/logo-zenit.png" alt="Zénit Salón" />
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          type="button"
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <nav
          id="main-navigation"
          className={menuOpen ? "nav-open" : ""}
          aria-label="Navegación principal"
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Inicio
          </Link>
          <Link href="/registro" onClick={() => setMenuOpen(false)}>
            Registro
          </Link>
          <Link href="/tienda" onClick={() => setMenuOpen(false)}>
            Tienda
          </Link>
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>
            Nosotros
          </Link>
        </nav>

        <div className="header-actions">
          <Link className="button button-small" href="/reservar">
            Reservar
          </Link>
          <Link className="account-link" href="/login">
            Ingresar
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span />
            Reserva Zénit
          </p>

          <h1>
            Tu momento,
            <em> a tu ritmo.</em>
          </h1>

          <p>
            Elegí los servicios con precio fijo, indicá cuándo preferís venir y
            enviá tu solicitud. Zénit confirmará disponibilidad directamente
            por WhatsApp.
          </p>

          <div className={styles.heroTrust}>
            <span>
              <b>✓</b> Selección múltiple
            </span>
            <span>
              <b>✓</b> Total visible
            </span>
            <span>
              <b>✓</b> Confirmación por WhatsApp
            </span>
          </div>
        </div>

        <aside className={styles.heroCard}>
          <small>Experiencia Zénit</small>
          <strong>Reservar también debe sentirse fácil.</strong>
          <p>
            Sin llamadas innecesarias, sin formularios eternos. Elegís,
            proponés fecha y Zénit confirma contigo.
          </p>
        </aside>
      </section>

      <section className={styles.bookingSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrowDark}>
              <span />
              Prepará tu visita
            </p>
            <h2>Elegí. Combiná. Reservá.</h2>
          </div>

          <p>
            Podés reservar varios servicios de precio fijo en una misma cita.
            Si buscás tintes o tratamientos capilares, primero cotizalos desde
            la sección de Servicios.
          </p>
        </div>

        <div className={styles.bookingLayout}>
          <section className={styles.servicesPanel}>
            <div className={styles.panelHeading}>
              <div>
                <small>Paso 01</small>
                <h3>Servicios para reservar</h3>
              </div>

              <Link href="/servicios">Volver a Servicios →</Link>
            </div>

            <div className={styles.serviceGroups}>
              <div className={styles.serviceGroup}>
                <div className={styles.groupTitle}>
                  <div>
                    <small>Precio fijo</small>
                    <h4>Cortes</h4>
                  </div>
                  <span>₡5.000 c/u</span>
                </div>

                <div className={styles.serviceList}>
                  {reservableServices
                    .filter((service) => service.category === "Cortes")
                    .map((service) => {
                      const selected = selectedIds.includes(service.id);

                      return (
                        <label
                          className={`${styles.serviceRow} ${
                            selected ? styles.serviceSelected : ""
                          }`}
                          key={service.id}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleService(service.id)}
                          />

                          <span className={styles.check}>
                            {selected ? "✓" : ""}
                          </span>

                          <span className={styles.serviceName}>
                            <strong>{service.name}</strong>
                            <small>
                              Incluye lavado, secado y planchado
                            </small>
                          </span>

                          <b>{formatPrice(service.price)}</b>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className={styles.serviceGroup}>
                <div className={styles.groupTitle}>
                  <div>
                    <small>Servicio completo</small>
                    <h4>Lavado, secado y planchado</h4>
                  </div>
                  <span>₡10.000</span>
                </div>

                {reservableServices
                  .filter(
                    (service) => service.category === "Servicio completo",
                  )
                  .map((service) => {
                    const selected = selectedIds.includes(service.id);

                    return (
                      <label
                        className={`${styles.serviceRow} ${
                          selected ? styles.serviceSelected : ""
                        }`}
                        key={service.id}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleService(service.id)}
                        />

                        <span className={styles.check}>
                          {selected ? "✓" : ""}
                        </span>

                        <span className={styles.serviceName}>
                          <strong>{service.name}</strong>
                          <small>Tratamiento básico incluido</small>
                        </span>

                        <b>{formatPrice(service.price)}</b>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className={styles.totalBar}>
              <div>
                <small>Servicios seleccionados</small>
                <strong>{selectedServices.length}</strong>
              </div>

              <div>
                <small>Total estimado</small>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
          </section>

          <section className={styles.formPanel}>
            <div className={styles.panelHeading}>
              <div>
                <small>Paso 02</small>
                <h3>Fecha y datos</h3>
              </div>
            </div>

            <form className={styles.form} onSubmit={submitReservation}>
              <label>
                Nombre completo
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ej. María González"
                />
              </label>

              <label>
                WhatsApp
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  placeholder="Ej. 7124 6337"
                />
              </label>

              <div className={styles.formRow}>
                <label>
                  Fecha preferida
                  <input
                    name="date"
                    type="date"
                    min={todayISO()}
                    required
                  />
                </label>

                <label>
                  Hora preferida
                  <input name="time" type="time" required />
                </label>
              </div>

              <label>
                Notas para Zénit
                <textarea
                  name="notes"
                  placeholder="Algún detalle que quieras comentarnos antes de la cita."
                />
              </label>

              <div className={styles.summary}>
                <small>Tu reserva</small>

                {selectedServices.length ? (
                  <div className={styles.summaryList}>
                    {selectedServices.map((service) => (
                      <div key={service.id}>
                        <span>{service.name}</span>
                        <b>{formatPrice(service.price)}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Elegí al menos un servicio para continuar.</p>
                )}

                <div className={styles.summaryTotal}>
                  <span>Total estimado</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>

              {submitted && (
                <p className={styles.successMessage}>
                  Abrimos WhatsApp con tu solicitud. Enviá el mensaje para que
                  Zénit pueda confirmar disponibilidad.
                </p>
              )}

              <button
                className={styles.submitButton}
                type="submit"
                disabled={!selectedServices.length}
              >
                Enviar solicitud por WhatsApp
                <span aria-hidden="true">→</span>
              </button>

              <p className={styles.formNote}>
                Esta solicitud no confirma automáticamente la cita. Zénit
                confirmará fecha y hora por WhatsApp.
              </p>
            </form>
          </section>
        </div>

        <div className={styles.bookingNote}>
          <span aria-hidden="true">✦</span>
          <div>
            <small>¿Buscás color o tratamiento?</small>
            <strong>Primero cotizamos, luego reservamos.</strong>
            <p>
              Tintes y tratamientos capilares dependen de valoración, largo y
              cantidad de cabello. Podés seleccionar varios y cotizarlos juntos
              desde Servicios.
            </p>
            <Link href="/servicios">Ir a cotizar servicios →</Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <img src="/logo-zenit.png" alt="Zénit Salón" />
        </div>

        <div className="footer-contact" aria-label="Información de contacto">
          <p>
            <strong>Teléfono y WhatsApp</strong>
            <span>+506 7124-6337</span>
          </p>
          <p>
            <strong>Ubicación</strong>
            <span>Dulce Nombre, Calle Sancho, San Carlos</span>
          </p>
        </div>

        <p className="footer-copyright">© 2026 Zénit Salón</p>
      </footer>
    </main>
  );
}