"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./nosotros.module.css";

const WHATSAPP_URL =
  "https://wa.me/50671246337?text=Hola%2C%20Z%C3%A9nit%20Sal%C3%B3n.%20Quiero%20m%C3%A1s%20informaci%C3%B3n.";
const GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/6EC4ZyQzdNQpkdxS8";
const WAZE_URL =
  "https://www.waze.com/ul?q=Dulce%20Nombre%20Calle%20Sancho%20San%20Carlos%20Costa%20Rica&navigate=yes";

export default function NosotrosPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link href="/reservar" onClick={() => setMenuOpen(false)}>
            Reservar
          </Link>
          <Link
            className="active"
            href="/nosotros"
            onClick={() => setMenuOpen(false)}
          >
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
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroGlowOne} aria-hidden="true" />
        <div className={styles.heroGlowTwo} aria-hidden="true" />

        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            <span />
            Nosotros
          </p>

          <h1>
            Donde naturaleza y belleza
            <em> encuentran su punto máximo.</em>
          </h1>

          <p className={styles.heroLead}>
            Zénit Salón nace para unir belleza, técnica y tranquilidad en un
            espacio donde cada visita se sienta personal. En medio del paisaje
            de San Carlos, cuidamos tu estilo sin perder de vista algo
            esencial: que también disfrutés el momento.
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/reservar">
              Reservar una cita
              <span>→</span>
            </Link>

            <a
              className={styles.secondaryButton}
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
            >
              Hablar con Zénit
            </a>
          </div>

          <div className={styles.heroTrust}>
            <span>
              <b>✦</b>
              Atención personalizada
            </span>
            <span>
              <b>✦</b>
              Entorno natural
            </span>
            <span>
              <b>✦</b>
              Belleza con propósito
            </span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.brandStage}>
            <span className={styles.orbitOne} />
            <span className={styles.orbitTwo} />
            <span className={styles.orbitThree} />

            <div className={styles.logoPanel}>
              <img src="/logo-zenit.png" alt="Zénit Salón" />

              <div className={styles.logoCaption}>
                <small>San Carlos · Costa Rica</small>
                <strong>El punto máximo de tu belleza.</strong>
              </div>
            </div>
          </div>

          <div className={styles.locationBadge}>
            <span>⌖</span>
            <div>
              <small>Estamos en</small>
              <strong>Dulce Nombre, Calle Sancho</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              <span />
              La esencia Zénit
            </p>
            <h2>Más que un servicio de belleza.</h2>
          </div>

          <p>
            Queremos que cada persona que llegue a Zénit encuentre una
            experiencia cuidada, moderna y cercana; una mezcla entre técnica,
            estilo y la calma propia de nuestro entorno.
          </p>
        </div>

        <div className={styles.storyGrid}>
          <article className={styles.storyMain}>
            <small>01 · Nuestra forma de trabajar</small>
            <h3>Escuchamos primero. Creamos después.</h3>
            <p>
              Cada cabello, cada estilo y cada persona requieren una mirada
              distinta. Por eso empezamos entendiendo qué buscás y qué querés
              sentir cuando salgás del salón.
            </p>

            <p>
              Desde un corte hasta un cambio de color o tratamiento, buscamos
              que el resultado se sienta tuyo, no una fórmula repetida.
            </p>
          </article>

          <div className={styles.valuesGrid}>
            <article className={styles.valueCard}>
              <span>✦</span>
              <small>Detalle</small>
              <h3>Precisión</h3>
              <p>
                Técnica, cuidado y atención en cada paso del servicio.
              </p>
            </article>

            <article className={styles.valueCard}>
              <span>✦</span>
              <small>Experiencia</small>
              <h3>Calma</h3>
              <p>
                Un entorno pensado para hacer una pausa y disfrutar el proceso.
              </p>
            </article>

            <article className={styles.valueCard}>
              <span>✦</span>
              <small>Identidad</small>
              <h3>Estilo</h3>
              <p>
                Resultados que acompañan tu personalidad, rutina y forma de
                verte.
              </p>
            </article>

            <article className={styles.valueCard}>
              <span>✦</span>
              <small>Relación</small>
              <h3>Cercanía</h3>
              <p>
                Atención directa, humana y sin convertir tu visita en una
                experiencia impersonal.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.experienceSection}>
        <article className={styles.experienceCard}>
          <div>
            <p className={styles.eyebrowLight}>
              <span />
              Nuestra ubicación también es parte de la experiencia
            </p>

            <h2>Entre montaña, aire fresco y tranquilidad.</h2>

            <p>
              Zénit está en Dulce Nombre, Calle Sancho, San Carlos. Un entorno
              natural que ayuda a convertir una visita al salón en algo más
              cercano a un respiro dentro de la rutina.
            </p>
          </div>

          <div className={styles.experienceStats}>
            <div>
              <small>Ubicación</small>
              <strong>San Carlos</strong>
            </div>

            <div>
              <small>Atención</small>
              <strong>Personalizada</strong>
            </div>

            <div>
              <small>Ambiente</small>
              <strong>Natural</strong>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.directionsSection}>
        <div className={styles.directionsCard}>
          <div className={styles.directionsCopy}>
            <p className={styles.eyebrowLight}>
              <span />
              Cómo llegar
            </p>
            <h2>Tu camino a Zénit empieza aquí.</h2>
            <p>
              Estamos en Dulce Nombre, Calle Sancho, San Carlos. Abrí tu app
              favorita y seguí la ruta directamente hasta el salón.
            </p>
          </div>

          <div className={styles.directionsActions}>
            <a
              className={styles.mapsButton}
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.directionIcon} aria-hidden="true">⌖</span>
              <span>
                <small>Abrir en</small>
                <strong>Google Maps</strong>
              </span>
              <b aria-hidden="true">→</b>
            </a>

            <a
              className={styles.wazeButton}
              href={WAZE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.directionIcon} aria-hidden="true">↗</span>
              <span>
                <small>Abrir en</small>
                <strong>Waze</strong>
              </span>
              <b aria-hidden="true">→</b>
            </a>
          </div>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              <span />
              Contacto y ubicación
            </p>
            <h2>Cuando quieras, te esperamos.</h2>
          </div>

          <p>
            Escribinos para resolver dudas, llegar al salón o reservar tu
            próxima visita.
          </p>
        </div>

        <div className={styles.contactGrid}>
          <article className={styles.contactCard}>
            <small>WhatsApp oficial</small>
            <strong>+506 7124-6337</strong>
            <p>
              Consultas, cotizaciones y coordinación directa con Zénit.
            </p>

            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              Escribir por WhatsApp
              <span>→</span>
            </a>
          </article>

          <article className={styles.contactCard}>
            <small>Tu próxima visita</small>
            <strong>Elegí tu momento Zénit.</strong>
            <p>
              Seleccioná servicios de precio fijo y enviá tu solicitud de cita.
            </p>

            <Link href="/reservar">
              Reservar ahora
              <span>→</span>
            </Link>
          </article>
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