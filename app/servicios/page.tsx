"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./servicios.module.css";

type ServiceMode = "quote" | "reserve";

type Service = {
  id: string;
  name: string;
  category: string;
  mode: ServiceMode;
  price?: number;
  note?: string;
};

type ServiceCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  services: Service[];
};

const WHATSAPP_NUMBER = "50671246337";

const sharedIncluded =
  "Incluye lavado, secado y planchado al finalizar el servicio.";

const serviceCategories: ServiceCategory[] = [
  {
    id: "cortes",
    name: "Cortes",
    eyebrow: "Precio fijo",
    description:
      "Todos los cortes tienen un precio fijo de ₡5.000 e incluyen lavado, secado y planchado.",
    services: [
      { id: "corte-recto", name: "Corte recto", category: "Cortes", mode: "reserve", price: 5000 },
      { id: "corte-v", name: "Corte en V", category: "Cortes", mode: "reserve", price: 5000 },
      { id: "corte-mariposa", name: "Corte mariposa", category: "Cortes", mode: "reserve", price: 5000 },
      { id: "corte-capas", name: "Corte en capas", category: "Cortes", mode: "reserve", price: 5000 },
      { id: "corte-pixie", name: "Corte pixie", category: "Cortes", mode: "reserve", price: 5000 },
      { id: "corte-bob-chanel", name: "Corte bob o chanel", category: "Cortes", mode: "reserve", price: 5000 },
      { id: "corte-clasico-hombre", name: "Corte clásico de hombre", category: "Cortes", mode: "reserve", price: 5000 },
    ],
  },
  {
    id: "tratamientos-capilares",
    name: "Tratamientos capilares",
    eyebrow: "Cotización personalizada",
    description:
      "Seleccioná uno o varios tratamientos y Zénit te cotizará según largo, cantidad de cabello y valoración.",
    services: [
      { id: "velo-brillo", name: "Velo de brillo", category: "Tratamientos capilares", mode: "quote" },
      { id: "aminoacidos", name: "Aminoácidos", category: "Tratamientos capilares", mode: "quote" },
      { id: "tratamiento-danos", name: "Tratamiento de daños", category: "Tratamientos capilares", mode: "quote" },
      { id: "botox-alisante", name: "Botox alisante", category: "Tratamientos capilares", mode: "quote" },
      { id: "botox-humectante", name: "Botox humectante", category: "Tratamientos capilares", mode: "quote" },
      { id: "celulas-madres", name: "Células madres", category: "Tratamientos capilares", mode: "quote" },
      { id: "keratina", name: "Keratina", category: "Tratamientos capilares", mode: "quote" },
      { id: "nanoplastia", name: "Nanoplastia", category: "Tratamientos capilares", mode: "quote" },
      { id: "liso-extremo", name: "Liso extremo", category: "Tratamientos capilares", mode: "quote" },
    ],
  },
  {
    id: "tintes",
    name: "Tintes",
    eyebrow: "Cotización personalizada",
    description:
      "Elegí una o varias técnicas de color para solicitar una cotización directamente por WhatsApp.",
    services: [
      { id: "tinte-fantasia", name: "Tinte fantasía", category: "Tintes", mode: "quote" },
      { id: "tinte-global", name: "Tinte global", category: "Tintes", mode: "quote" },
      { id: "cubrimiento-canas", name: "Cubrimiento de canas", category: "Tintes", mode: "quote" },
      { id: "mechas-rayitos", name: "Diseño de mechas y rayitos", category: "Tintes", mode: "quote" },
      { id: "balayage", name: "Balayage", category: "Tintes", mode: "quote" },
      { id: "morena-iluminada", name: "Morena iluminada", category: "Tintes", mode: "quote" },
    ],
  },
  {
    id: "lavado-secado-planchado",
    name: "Lavado, secado y planchado",
    eyebrow: "Servicio completo",
    description:
      "También podés reservar lavado, secado y planchado como servicio independiente con tratamiento básico incluido.",
    services: [
      {
        id: "lavado-secado-planchado-tratamiento",
        name: "Lavado + secado + planchado + tratamiento básico",
        category: "Lavado, secado y planchado",
        mode: "reserve",
        price: 10000,
        note: "Tratamiento básico incluido.",
      },
    ],
  },
];

const allServices = serviceCategories.flatMap((category) => category.services);

function formatPrice(value: number) {
  return `₡${value.toLocaleString("es-CR")}`;
}

function buildWhatsAppMessage(services: Service[]) {
  const lines = services.map(
    (service) => `• ${service.category}: ${service.name}`,
  );

  return [
    "Hola, Zénit Salón.",
    "",
    "Quiero cotizar los siguientes servicios:",
    ...lines,
    "",
    "¿Me pueden brindar información y ayudarme con la cotización?",
  ].join("\n");
}

export default function ServiciosPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedServices = useMemo(
    () => allServices.filter((service) => selectedIds.includes(service.id)),
    [selectedIds],
  );

  const quoteServices = useMemo(
    () => selectedServices.filter((service) => service.mode === "quote"),
    [selectedServices],
  );

  const reserveServices = useMemo(
    () => selectedServices.filter((service) => service.mode === "reserve"),
    [selectedServices],
  );

  const reserveTotal = useMemo(
    () =>
      reserveServices.reduce(
        (total, service) => total + (service.price || 0),
        0,
      ),
    [reserveServices],
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  };

  const toggleService = (serviceId: string) => {
    setSelectedIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const quoteSelected = () => {
    if (!quoteServices.length) return;

    const message = buildWhatsAppMessage(quoteServices);

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const reserveSelected = () => {
    if (!reserveServices.length) return;

    const params = new URLSearchParams();
    params.set(
      "servicios",
      reserveServices.map((service) => service.id).join(","),
    );

    window.location.href = `/reservar?${params.toString()}`;
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
          <Link className="active" href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
        </nav>

        <div className="header-actions">
          <a className="button button-small" href="#catalogo">
            Elegir servicios
          </a>
          <Link className="account-link" href="/login">Ingresar</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid} aria-hidden="true" />

        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span />
            Servicios Zénit
          </p>

          <h1>
            Belleza entre
            <em> montaña y tranquilidad.</em>
          </h1>

          <p className={styles.heroLead}>
            En Dulce Nombre, Calle Sancho, la experiencia empieza antes de
            sentarte frente al espejo. Zénit une técnica, cuidado y la calma de
            San Carlos para convertir cada visita en un momento para vos.
          </p>

          <div className={styles.heroHighlights}>
            <span><b>✦</b> Atención personalizada</span>
            <span><b>✦</b> Entorno tranquilo</span>
            <span><b>✦</b> Lavado, secado y planchado incluidos</span>
          </div>

          <a className={styles.heroButton} href="#catalogo">
            Explorar servicios
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <aside className={styles.heroEditorial}>
          <small>La experiencia Zénit</small>
          <strong>Tu tiempo también merece un buen lugar.</strong>
          <p>
            Vení por tu estilo. Quedate por esa sensación de bajar el ritmo,
            respirar y salir renovada.
          </p>
        </aside>
      </section>

      <section className={styles.catalogSection} id="catalogo">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              <span />
              Elegí tus servicios
            </p>
            <h2>Seleccioná uno o varios.</h2>
          </div>

          <p>
            Podés combinar varios servicios en una misma selección. Los de
            precio fijo se preparan para reserva; tratamientos y tintes se
            envían juntos para cotización por WhatsApp.
          </p>
        </div>

        <div className={styles.includedBanner}>
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Incluido en cortes, tratamientos y tintes</strong>
            <p>{sharedIncluded}</p>
          </div>
        </div>

        <div className={styles.catalog}>
          {serviceCategories.map((category) => {
            const isOpen = Boolean(openCategories[category.id]);
            const selectedInCategory = category.services.filter((service) =>
              selectedIds.includes(service.id),
            ).length;

            return (
              <section
                className={`${styles.categorySection} ${
                  isOpen ? styles.categoryOpen : ""
                }`}
                key={category.id}
              >
                <button
                  type="button"
                  className={styles.categoryToggle}
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isOpen}
                >
                  <div className={styles.categoryHeading}>
                    <span>✦</span>
                    <div>
                      <p>{category.eyebrow}</p>
                      <h2>{category.name}</h2>
                      <small>{category.description}</small>
                    </div>
                  </div>

                  <div className={styles.categoryMeta}>
                    {selectedInCategory > 0 && (
                      <span className={styles.selectedBadge}>
                        {selectedInCategory} seleccionado{selectedInCategory > 1 ? "s" : ""}
                      </span>
                    )}
                    <span>{isOpen ? "Ocultar" : "Ver servicios"}</span>
                    <b aria-hidden="true">+</b>
                  </div>
                </button>

                <div className={styles.categoryContent} aria-hidden={!isOpen}>
                  <div className={styles.checklist}>
                    {category.services.map((service) => {
                      const selected = selectedIds.includes(service.id);

                      return (
                        <label
                          className={`${styles.serviceRow} ${
                            selected ? styles.serviceRowSelected : ""
                          }`}
                          key={service.id}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleService(service.id)}
                          />

                          <span className={styles.customCheck} aria-hidden="true">
                            {selected ? "✓" : ""}
                          </span>

                          <span className={styles.serviceInfo}>
                            <strong>{service.name}</strong>
                            <small>
                              {service.mode === "reserve"
                                ? "Precio fijo · Reserva"
                                : "Cotización personalizada"}
                            </small>
                            {service.note && <em>{service.note}</em>}
                          </span>

                          <span className={styles.servicePrice}>
                            {service.price
                              ? formatPrice(service.price)
                              : "Cotizar"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <section className={styles.selectionPanel} aria-live="polite">
          <div className={styles.selectionHeading}>
            <div>
              <small>Tu selección</small>
              <h3>
                {selectedServices.length
                  ? `${selectedServices.length} servicio${selectedServices.length > 1 ? "s" : ""}`
                  : "Todavía no elegiste servicios"}
              </h3>
            </div>

            {selectedServices.length > 0 && (
              <button type="button" onClick={clearSelection}>
                Limpiar selección
              </button>
            )}
          </div>

          {selectedServices.length > 0 ? (
            <>
              <div className={styles.selectedList}>
                {selectedServices.map((service) => (
                  <button
                    type="button"
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={styles.selectedChip}
                    title={`Quitar ${service.name}`}
                  >
                    <span>{service.name}</span>
                    <b>×</b>
                  </button>
                ))}
              </div>

              <div className={styles.actionGrid}>
                <div className={styles.actionCard}>
                  <small>Cotización</small>
                  <strong>
                    {quoteServices.length} servicio{quoteServices.length !== 1 ? "s" : ""}
                  </strong>
                  <p>
                    Tratamientos y tintes se envían juntos en un solo mensaje.
                  </p>
                  <button
                    type="button"
                    className={styles.whatsappButton}
                    onClick={quoteSelected}
                    disabled={!quoteServices.length}
                  >
                    Cotizar selección por WhatsApp
                    <span>→</span>
                  </button>
                </div>

                <div className={styles.actionCard}>
                  <small>Reserva</small>
                  <strong>
                    {reserveServices.length} servicio{reserveServices.length !== 1 ? "s" : ""}
                  </strong>
                  <p>
                    Total de servicios con precio fijo:{" "}
                    <b>{formatPrice(reserveTotal)}</b>
                  </p>
                  <button
                    type="button"
                    className={styles.reserveButton}
                    onClick={reserveSelected}
                    disabled={!reserveServices.length}
                  >
                    Reservar selección
                    <span>→</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.emptySelection}>
              Marcá los servicios que te interesan. Podés seleccionar varios de
              diferentes categorías.
            </p>
          )}
        </section>

        <div className={styles.quoteNote}>
          <span aria-hidden="true">✦</span>
          <div>
            <small>Dos caminos, una sola selección</small>
            <strong>Cotizá lo variable. Reservá lo que ya tiene precio.</strong>
            <p>
              Si elegís servicios de ambos tipos, podés cotizar tratamientos y
              tintes por WhatsApp y luego reservar los servicios de precio fijo
              sin perder tu selección.
            </p>
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