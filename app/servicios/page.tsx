"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./servicios.module.css";

type Service = {
  id: string;
  name: string;
  description: string;
  details: string[];
};

type ServiceCategory = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  services: Service[];
};

const WHATSAPP_NUMBER = "50671246337";

const serviceCategories: ServiceCategory[] = [
  {
    id: "cortes",
    name: "Cortes",
    eyebrow: "Diseño y estilo",
    description:
      "Opciones pensadas para renovar, definir o mantener tu estilo con una atención personalizada.",
    services: [
      {
        id: "corte-clasico",
        name: "Corte clásico",
        description:
          "Un corte limpio y versátil, adaptado a la forma de tu rostro, textura y estilo personal.",
        details: [
          "Asesoría breve antes de iniciar",
          "Definición y acabado del corte",
          "Lavado de cabello incluido al finalizar",
        ],
      },
      {
        id: "corte-en-capas",
        name: "Corte en capas",
        description:
          "Movimiento, ligereza y dimensión para quienes buscan transformar la caída natural del cabello.",
        details: [
          "Diseño según largo y volumen",
          "Acabado adaptado al movimiento del cabello",
          "Lavado de cabello incluido al finalizar",
        ],
      },
      {
        id: "corte-bob-lob",
        name: "Bob / Lob",
        description:
          "Una línea elegante y moderna que puede adaptarse desde un bob definido hasta un lob más largo.",
        details: [
          "Definición de largo y estructura",
          "Acabado personalizado",
          "Lavado de cabello incluido al finalizar",
        ],
      },
      {
        id: "mantenimiento-flequillo",
        name: "Flequillo y mantenimiento",
        description:
          "Ajustes precisos para mantener la forma, proporción y frescura de tu corte entre visitas.",
        details: [
          "Ajuste de flequillo o contorno",
          "Corrección de forma cuando corresponda",
          "Lavado de cabello incluido al finalizar",
        ],
      },
    ],
  },
  {
    id: "tintes",
    name: "Tintes",
    eyebrow: "Color profesional",
    description:
      "Técnicas de color pensadas para acompañar tu estilo, desde mantenimiento hasta cambios de imagen.",
    services: [
      {
        id: "tinte-completo",
        name: "Tinte completo",
        description:
          "Aplicación de color en todo el cabello para renovar el tono, intensificarlo o realizar un cambio completo.",
        details: [
          "Valoración visual previa",
          "Aplicación de color según objetivo",
          "Lavado de cabello incluido al finalizar",
        ],
      },
      {
        id: "retoque-raiz",
        name: "Retoque de raíz",
        description:
          "Mantenimiento del crecimiento para conservar un color uniforme y una apariencia cuidada.",
        details: [
          "Aplicación localizada en crecimiento",
          "Integración con el tono existente",
          "Lavado de cabello incluido al finalizar",
        ],
      },
      {
        id: "balayage",
        name: "Balayage",
        description:
          "Iluminación de acabado natural y progresivo para aportar dimensión sin perder elegancia.",
        details: [
          "Valoración del color actual",
          "Diseño de iluminación según resultado buscado",
          "Lavado de cabello incluido al finalizar",
        ],
      },
      {
        id: "mechas-iluminaciones",
        name: "Mechas / Iluminaciones",
        description:
          "Trabajo de luces y contraste para crear profundidad, brillo y dimensión en el cabello.",
        details: [
          "Selección de técnica según el resultado",
          "Distribución personalizada de luces",
          "Lavado de cabello incluido al finalizar",
        ],
      },
    ],
  },
];

function buildWhatsAppMessage(category: string, service: string) {
  return [
    "Hola, Zénit Salón.",
    "",
    `Me interesa cotizar el servicio: ${service}`,
    `Categoría: ${category}`,
    "",
    "¿Me pueden brindar más información y ayudarme con la cotización?",
  ].join("\n");
}

export default function ServiciosPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  };

  const quoteService = (category: string, service: string) => {
    const message = buildWhatsAppMessage(category, service);

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
          <Link
            className="active"
            href="/servicios"
            onClick={() => setMenuOpen(false)}
          >
            Servicios
          </Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>
            Nosotros
          </Link>
        </nav>

        <div className="header-actions">
          <a className="button button-small" href="#catalogo">
            Cotizar
          </a>
          <Link className="account-link" href="/login">
            Ingresar
          </Link>
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
            <span>
              <b>✦</b>
              Atención personalizada
            </span>
            <span>
              <b>✦</b>
              Entorno tranquilo
            </span>
            <span>
              <b>✦</b>
              Lavado incluido
            </span>
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
              Elegí tu servicio
            </p>
            <h2>Cortes y color, a tu manera.</h2>
          </div>

          <p>
            Explorá las opciones disponibles y cotizá directamente con Zénit
            por WhatsApp. Por ahora no mostramos precios porque cada caso puede
            requerir una valoración diferente.
          </p>
        </div>

        <div className={styles.catalog}>
          {serviceCategories.map((category) => {
            const isOpen = Boolean(openCategories[category.id]);

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
                    <span>
                      {isOpen ? "Ocultar servicios" : "Ver servicios"}
                    </span>
                    <b aria-hidden="true">+</b>
                  </div>
                </button>

                <div
                  className={styles.categoryContent}
                  aria-hidden={!isOpen}
                >
                  <div className={styles.serviceGrid}>
                    {category.services.map((service) => (
                      <article className={styles.serviceCard} key={service.id}>
                        <div className={styles.cardTop}>
                          <small>{category.name}</small>
                          <span aria-hidden="true">✦</span>
                        </div>

                        <h3>{service.name}</h3>
                        <p>{service.description}</p>

                        <details className={styles.serviceDetails}>
                          <summary>
                            <span>Ver qué incluye</span>
                            <b aria-hidden="true">+</b>
                          </summary>

                          <div>
                            <ul>
                              {service.details.map((detail) => (
                                <li key={detail}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        </details>

                        <div className={styles.washIncluded}>
                          <span aria-hidden="true">✓</span>
                          Incluye lavado de cabello al finalizar
                        </div>

                        <button
                          type="button"
                          className={styles.quoteButton}
                          onClick={() =>
                            quoteService(category.name, service.name)
                          }
                        >
                          Cotizar por WhatsApp
                          <span aria-hidden="true">→</span>
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className={styles.quoteNote}>
          <span aria-hidden="true">✦</span>
          <div>
            <small>Cotización personalizada</small>
            <strong>Elegí primero. Coordinamos los detalles después.</strong>
            <p>
              Al tocar “Cotizar por WhatsApp” enviaremos el nombre del servicio
              al WhatsApp oficial de Zénit para continuar la conversación.
              La reserva de citas será una sección independiente.
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