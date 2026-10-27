"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AvailabilityPicker from "../../src/components/AvailabilityPicker";
import styles from "./reservar.module.css";

type ServiceMode = "quote" | "reserve";

type CatalogService = {
  id: string;
  name: string;
  category: string;
  mode: ServiceMode;
  price?: number | null;
  note?: string | null;
};

type ServiceCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  services: CatalogService[];
};

type ReservableService = CatalogService & {
  mode: "reserve";
  price: number;
};

type QuotedService = CatalogService & {
  mode: "quote";
};

const API_URL = "/api/backend";
const WHATSAPP_NUMBER = "50671246337";

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
  const [catalogCategories, setCatalogCategories] =
    useState<ServiceCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alreadyQuoted, setAlreadyQuoted] = useState(false);
  const [selectedQuotedIds, setSelectedQuotedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [requestKey, setRequestKey] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(`${API_URL}/api/catalog/services`, {
          cache: "no-store",
        });

        if (!response.ok) throw Error("No se pudieron cargar los servicios.");

        const data = await response.json();
        if (Array.isArray(data.categories)) {
          setCatalogCategories(data.categories);
        }
      } catch {
        setBookingError("No se pudieron cargar los servicios vigentes. Actualizá la página o contactá al salón.");
      }
    };

    void loadServices();
  }, []);

  const allServices = useMemo(
    () => catalogCategories.flatMap((category) => category.services),
    [catalogCategories],
  );

  const reservableServices = useMemo(
    () =>
      allServices.filter(
        (service): service is ReservableService =>
          service.mode === "reserve" && typeof service.price === "number",
      ),
    [allServices],
  );

  const quotedServices = useMemo(
    () =>
      allServices.filter(
        (service): service is QuotedService => service.mode === "quote",
      ),
    [allServices],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const servicesParam = params.get("servicios");

    if (!servicesParam) return;

    const validIds = servicesParam
      .split(",")
      .filter((id) => reservableServices.some((service) => service.id === id));

    const timer = setTimeout(() => setSelectedIds([...new Set(validIds)]), 0);
    return () => clearTimeout(timer);
  }, [reservableServices]);

  const selectedServices = useMemo(
    () => reservableServices.filter((service) => selectedIds.includes(service.id)),
    [reservableServices, selectedIds],
  );

  const selectedQuotedServices = useMemo(
    () => quotedServices.filter((service) => selectedQuotedIds.includes(service.id)),
    [quotedServices, selectedQuotedIds],
  );

  const reservableGroups = useMemo(() => {
    const groups = new Map<string, ReservableService[]>();
    for (const service of reservableServices) {
      const current = groups.get(service.category) || [];
      current.push(service);
      groups.set(service.category, current);
    }
    return [...groups.entries()].map(([name, services]) => ({ name, services }));
  }, [reservableServices]);

  const quotedGroups = useMemo(() => {
    const groups = new Map<string, QuotedService[]>();
    for (const service of quotedServices) {
      const current = groups.get(service.category) || [];
      current.push(service);
      groups.set(service.category, current);
    }
    return [...groups.entries()].map(([name, services]) => ({ name, services }));
  }, [quotedServices]);

  const total = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices],
  );

  const hasAnyService =
    selectedServices.length > 0 || selectedQuotedServices.length > 0;

  const toggleService = (serviceId: string) => {
    setSelectedIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const toggleQuotedService = (serviceId: string) => {
    setSelectedQuotedIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const handleQuotedChange = (checked: boolean) => {
    setAlreadyQuoted(checked);

    if (!checked) {
      setSelectedQuotedIds([]);
    }
  };

  const submitReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasAnyService) return;

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const date = String(form.get("date") || "").trim();
    const time = String(form.get("time") || "").trim();
    const notes = String(form.get("notes") || "").trim();

    const fixedLines = selectedServices.map(
      (service) => `• ${service.name} — ${formatPrice(service.price)}`,
    );

    const quotedLines = selectedQuotedServices.map(
      (service) => `• ${service.category}: ${service.name}`,
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
      selectedServices.length ? "Servicios con precio fijo:" : "",
      ...fixedLines,
      selectedServices.length ? `Total precio fijo: ${formatPrice(total)}` : "",
      selectedQuotedServices.length ? "" : "",
      selectedQuotedServices.length ? "Servicios cotizados previamente por WhatsApp:" : "",
      ...quotedLines,
      selectedQuotedServices.length
        ? "Estos servicios ya fueron cotizados previamente con Zénit."
        : "",
      "",
      "Incluye lavado, secado y planchado cuando corresponda.",
      notes ? `Notas: ${notes}` : "",
      "",
      "Entiendo que la fecha y hora quedan sujetas a confirmación de Zénit.",
    ]
      .filter(Boolean)
      .join("\n");

    setBookingError(""); setSubmitting(true); setSubmitted(false);
    try {
      if (selectedQuotedServices.length) {
        const response = await fetch(`${API_URL}/api/service-requests`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,phone,service:[...selectedServices,...selectedQuotedServices].map(s=>s.name).join(" + ").slice(0,120),details:notes || "Solicitud de cita con servicios cotizados previamente",preferredDate:date,preferredTime:time})});
        const result=await response.json();if(!response.ok)throw Error(result.error || "No se pudo guardar la solicitud.");
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
      } else {
        if(!time)throw Error("Elegí un horario disponible de la agenda.");
        const key=requestKey || crypto.randomUUID();setRequestKey(key);
        const response=await fetch(`${API_URL}/api/agenda/appointments`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date,time,services:selectedIds,notes,requestKey:key})});
        const result=await response.json();if(!response.ok){if(response.status<500)setRequestKey("");throw Error(result.error || "No se pudo reservar.");}
      }
      setSubmitted(true);setRequestKey("");
    } catch(error){setBookingError(error instanceof Error?error.message:"No se pudo conectar con el salón.");}
    finally{setSubmitting(false);}

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
          <Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/registro" onClick={() => setMenuOpen(false)}>Registro</Link>
          <Link href="/tienda" onClick={() => setMenuOpen(false)}>Tienda</Link>
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link className="active" href="/reservar" onClick={() => setMenuOpen(false)}>
            Reservar
          </Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
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
            Reservá servicios de precio fijo o agendá los tintes y tratamientos
            que ya cotizaste previamente por WhatsApp.
          </p>

          <div className={styles.heroTrust}>
            <span><b>✓</b> Selección múltiple</span>
            <span><b>✓</b> Cotizaciones previas</span>
            <span><b>✓</b> Confirmación por WhatsApp</span>
          </div>
        </div>

        <aside className={styles.heroCard}>
          <small>Experiencia Zénit</small>
          <strong>De la cotización a tu cita, sin vueltas.</strong>
          <p>
            Si ya coordinaste un tinte o tratamiento por WhatsApp, seleccioná
            ese servicio aquí y proponé tu fecha de visita.
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
            Podés combinar varios servicios de precio fijo y también agregar
            tintes o tratamientos que ya hayan sido cotizados previamente.
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
              {reservableGroups.map((group) => {
                const uniquePrices = [...new Set(group.services.map((service) => service.price))];
                const groupPrice =
                  uniquePrices.length === 1
                    ? `${formatPrice(uniquePrices[0])}${group.services.length > 1 ? " c/u" : ""}`
                    : "Precio fijo";

                return (
                  <div className={styles.serviceGroup} key={group.name}>
                    <div className={styles.groupTitle}>
                      <div>
                        <small>Precio fijo</small>
                        <h4>{group.name}</h4>
                      </div>
                      <span>{groupPrice}</span>
                    </div>

                    <div className={styles.serviceList}>
                      {group.services.map((service) => {
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
                                {service.note ||
                                  "Incluye lavado, secado y planchado cuando corresponda"}
                              </small>
                            </span>

                            <b>{formatPrice(service.price)}</b>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className={styles.quotedBlock}>
                <label className={styles.quotedToggle}>
                  <input
                    type="checkbox"
                    checked={alreadyQuoted}
                    onChange={(event) => handleQuotedChange(event.target.checked)}
                  />

                  <span className={styles.quotedCheck}>
                    {alreadyQuoted ? "✓" : ""}
                  </span>

                  <span>
                    <strong>Ya realicé mi cotización por WhatsApp</strong>
                    <small>
                      Activá esta opción para reservar tintes o tratamientos que
                      Zénit ya te cotizó.
                    </small>
                  </span>
                </label>

                {alreadyQuoted && (
                  <div className={styles.quotedServices}>
                    <div className={styles.quotedIntro}>
                      <small>Cotización previa</small>
                      <h4>¿Qué servicio ya cotizaste?</h4>
                      <p>Podés seleccionar uno o varios.</p>
                    </div>

                    {quotedGroups.map((group) => (
                      <div className={styles.quotedCategory} key={group.name}>
                        <strong>{group.name}</strong>
                        <div className={styles.quotedGrid}>
                          {group.services.map((service) => {
                            const selected = selectedQuotedIds.includes(service.id);

                            return (
                              <label
                                className={`${styles.quotedServiceRow} ${
                                  selected ? styles.quotedServiceSelected : ""
                                }`}
                                key={service.id}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleQuotedService(service.id)}
                                />
                                <span>{selected ? "✓" : ""}</span>
                                <strong>{service.name}</strong>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.totalBar}>
              <div>
                <small>Servicios seleccionados</small>
                <strong>{selectedServices.length + selectedQuotedServices.length}</strong>
              </div>

              <div>
                <small>Total con precio fijo</small>
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
              {selectedQuotedServices.length > 0 ? <><label>
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

              </> : <p>Tu cita se vinculará al nombre y WhatsApp de tu cuenta registrada.</p>}
              {selectedQuotedServices.length ? <><p>Estos servicios requieren coordinación con el salón. La solicitud no aparta un cupo hasta que la dueña acuerde su duración.</p><label>Fecha preferida<input name="date" type="date" min={todayISO()}/></label><label>Hora preferida<input name="time" type="time"/></label></> : <AvailabilityPicker services={selectedIds}/>}

              <label>
                Notas para Zénit
                <textarea
                  name="notes"
                  placeholder="Algún detalle que quieras comentarnos antes de la cita."
                />
              </label>

              <div className={styles.summary}>
                <small>Tu reserva</small>

                {!hasAnyService ? (
                  <p>Elegí al menos un servicio para continuar.</p>
                ) : (
                  <>
                    {selectedServices.length > 0 && (
                      <div className={styles.summarySection}>
                        <strong>Precio fijo</strong>
                        <div className={styles.summaryList}>
                          {selectedServices.map((service) => (
                            <div key={service.id}>
                              <span>{service.name}</span>
                              <b>{formatPrice(service.price)}</b>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedQuotedServices.length > 0 && (
                      <div className={styles.summarySection}>
                        <strong>Cotizados previamente</strong>
                        <div className={styles.summaryList}>
                          {selectedQuotedServices.map((service) => (
                            <div key={service.id}>
                              <span>{service.name}</span>
                              <b>Cotizado</b>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className={styles.summaryTotal}>
                  <span>Total precio fijo</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>

              {submitted && (
                <p className={styles.successMessage}>
                  {selectedQuotedServices.length ? "Solicitud guardada. Coordiná la duración y el horario con el salón por WhatsApp." : <>Tu espacio quedó apartado mientras el salón confirma. Revisá el estado en <Link href="/mi-cuenta">Mis citas</Link>.</>}
                </p>
              )}

              {bookingError && <p role="alert" className={styles.formNote}>{bookingError}</p>}
              <button
                className={styles.submitButton}
                type="submit"
                disabled={!hasAnyService || submitting || submitted}
              >
                {submitting ? "Guardando…" : submitted ? "Solicitud guardada" : selectedQuotedServices.length ? "Coordinar con el salón" : "Solicitar mi cita"}
                <span aria-hidden="true">→</span>
              </button>

              <p className={styles.formNote}>
                Las citas requieren confirmación del salón. Los cupos se validan nuevamente al guardar.
              </p>
            </form>
          </section>
        </div>

        <div className={styles.bookingNote}>
          <span aria-hidden="true">✦</span>
          <div>
            <small>¿Todavía no cotizaste?</small>
            <strong>Primero cotizamos. Después reservamos.</strong>
            <p>
              Si querés un tinte o tratamiento y todavía no tenés cotización,
              seleccioná el servicio desde Servicios y envialo por WhatsApp.
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