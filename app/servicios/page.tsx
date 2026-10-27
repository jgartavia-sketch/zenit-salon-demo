"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./servicios.module.css";

type ServiceMode = "quote" | "reserve";

type Service = {
  id: string;
  name: string;
  category: string;
  mode: ServiceMode;
  price?: number | null;
  durationMinutes?: number | null;
  note?: string | null;
};

type ServiceCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  services: Service[];
};

const API_URL = "/api/backend";
const WHATSAPP_NUMBER = "50671246337";

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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [catalogError,setCatalogError]=useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(`${API_URL}/api/catalog/services`, {
          cache: "no-store",
        });

        if (!response.ok) throw Error();

        const data = await response.json();
        if (Array.isArray(data.categories)) {
          setServiceCategories(data.categories);
        }
      } catch {
        setCatalogError("No se pudieron cargar los servicios vigentes. Actualizá la página o contactá al salón.");
      }
    };

    void loadServices();
  }, []);

  const allServices = useMemo(
    () => serviceCategories.flatMap((category) => category.services),
    [serviceCategories],
  );

  const selectedServices = useMemo(
    () => allServices.filter((service) => selectedIds.includes(service.id)),
    [allServices, selectedIds],
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

    router.push(`/reservar?${params.toString()}`);
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
          <Link href="/reservar" onClick={() => setMenuOpen(false)}>Reservar</Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
        </nav>

        <div className="header-actions">
          <a className="button button-small" href="#catalogo">
            Elegir servicios
          </a>
          <Link className="account-link" href="/login">Ingresar</Link>
        </div>
      </header>
      {catalogError&&<p role="alert" style={{padding:"110px 24px 24px",color:"#173557",background:"#edf2f6"}}>{catalogError}</p>}

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
            tarifa definida se preparan para reserva; tratamientos y tintes se
            envían juntos para cotización por WhatsApp.
          </p>
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
                      <p>{category.id === "lavado-secado-planchado" ? "Combo Tratamiento Completo" : category.eyebrow.replace(/precio fijo/gi,"Tarifa del servicio")}</p>
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
                                ? "Servicio · Reserva"
                                : "Cotización personalizada"}
                            </small>
                            {service.note && <em>{service.note}</em>}
                          </span>

                          <span className={styles.servicePrice}>
                            {typeof service.price === "number"
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
                    Total seleccionado:{" "}
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