import Link from "next/link";
import styles from "./tienda.module.css";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  description: string;
  images: string[];
};

const products: Product[] = [
  {
    id: "yoorganic-moisturizing-shampoo",
    name: "Moisturizing Shampoo",
    brand: "YOORGANIC",
    category: "Shampoo",
    price: "₡1.000",
    description:
      "Shampoo profesional de enfoque hidratante para cabello seco o sensibilizado. Ayuda a mantener una apariencia suave, manejable y con brillo dentro de la rutina capilar.",
    images: [
      "/images/productos/yoorganic-moisturizing-shampoo.png",
      "/images/productos/yoorganic-moisturizing-shampoo-pink.png",
    ],
  },
  {
    id: "yoorganic-nourishing-shampoo",
    name: "Nourishing Shampoo",
    brand: "YOORGANIC",
    category: "Shampoo",
    price: "₡1.000",
    description:
      "Shampoo nutritivo para complementar rutinas de cuidado profesional, especialmente en cabellos que necesitan suavidad, manejabilidad y una apariencia saludable.",
    images: ["/images/productos/yoorganic-nourishing-shampoo.png"],
  },
  {
    id: "nevada-silver-shampoo",
    name: "Silver Shampoo",
    brand: "Nevada Professional",
    category: "Shampoo",
    price: "₡1.000",
    description:
      "Shampoo tipo silver pensado para el mantenimiento cosmético de cabellos claros, grises o decolorados. Ideal para una rutina de cuidado orientada a mantener una apariencia fría y uniforme.",
    images: ["/images/productos/nevada-silver-shampoo.png"],
  },
  {
    id: "yoorganic-nourishing-oil",
    name: "Nourishing Oil",
    brand: "YOORGANIC",
    category: "Aceites y sérums",
    price: "₡1.000",
    description:
      "Aceite capilar de acabado para medios y puntas. Ayuda a aportar brillo, suavidad y una apariencia más pulida dentro de la rutina diaria o profesional.",
    images: [
      "/images/productos/yoorganic-nourishing-oil.png",
      "/images/productos/yoorganic-nourishing-oil-golden.png",
    ],
  },
  {
    id: "karseell-maca-essence-oil",
    name: "Maca Essence Oil",
    brand: "Karseell",
    category: "Aceites y sérums",
    price: "₡1.000",
    description:
      "Aceite capilar pensado para aportar nutrición, brillo, hidratación y control del frizz. Puede aplicarse principalmente en medios y puntas para complementar el acabado del cabello.",
    images: [
      "/images/productos/karseell-maca-essence-oil.png",
      "/images/productos/karseell-maca-essence-oil-box-bottle.png",
      "/images/productos/karseell-maca-essence-oil-premium.png",
      "/images/productos/karseell-maca-care-system.png",
    ],
  },
  {
    id: "yoorganic-protein-hair-repairing-liquid",
    name: "Protein Hair Repairing Liquid",
    brand: "YOORGANIC",
    category: "Tratamientos",
    price: "₡1.000",
    description:
      "Tratamiento capilar líquido orientado al cuidado del cabello sensibilizado. Puede integrarse a una rutina profesional enfocada en mejorar suavidad, apariencia y manejabilidad.",
    images: ["/images/productos/yoorganic-protein-hair-repairing-liquid.png"],
  },
  {
    id: "nevada-leave-in-thermoactive",
    name: "Leave-in Thermoactive",
    brand: "Nevada Professional",
    category: "Tratamientos",
    price: "₡1.000",
    description:
      "Tratamiento sin enjuague pensado para acompañar el peinado y la preparación del cabello antes del secado o del uso de herramientas térmicas.",
    images: ["/images/productos/nevada-leave-in-thermoactive.png"],
  },
  {
    id: "wella-eimi-thermal-image",
    name: "EIMI Thermal Image",
    brand: "Wella Professionals",
    category: "Protección térmica",
    price: "₡1.000",
    description:
      "Spray de protección térmica diseñado para utilizarse antes del estilizado con herramientas de calor. Complementa el peinado profesional y ayuda a mantener un acabado pulido.",
    images: [
      "/images/productos/wella-eimi-thermal-image.png",
      "/images/productos/wella-eimi-thermal-image-box-bottle.png",
      "/images/productos/wella-thermal-image-premium.png",
      "/images/productos/wella-thermal-image-silver.png",
      "/images/productos/wella-thermal-image-final.png",
    ],
  },
];

const categories = ["Shampoo", "Aceites y sérums", "Tratamientos", "Protección térmica"];

export default function TiendaPage() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Zénit Salón, inicio">
          <img src="/logo-zenit.png" alt="Zénit Salón" />
        </Link>

        <nav aria-label="Navegación principal">
          <Link href="/">Inicio</Link>
          <Link href="/registro">Registro</Link>
          <Link className="active" href="/tienda">Tienda</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/nosotros">Nosotros</Link>
        </nav>

        <div className="header-actions">
          <Link className="button button-small" href="/servicios#solicitar-servicio">
            Reservar
          </Link>
          <Link className="account-link" href="/login">Ingresar</Link>
        </div>
      </header>

      <section className="section shop page-section" id="tienda">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span /> Tienda Zénit</p>
            <h2>Productos profesionales para prolongar tu experiencia.</h2>
          </div>
          <p>
            Explorá el catálogo por categoría. Tocá una card para desplegar la descripción.
          </p>
        </div>

        <div className={styles.catalog}>
          {categories.map((category) => {
            const categoryProducts = products.filter((product) => product.category === category);

            return (
              <section className={styles.categoryBlock} key={category}>
                <div className={styles.categoryTitle}>
                  <span>{category}</span>
                </div>

                <div className={styles.productGrid}>
                  {categoryProducts.map((product) => (
                    <details className={styles.productCard} key={product.id}>
                      <summary>
                        <div className={styles.imageStage}>
                          <img
                            src={product.images[0]}
                            alt={`${product.brand} ${product.name}`}
                            loading="lazy"
                          />
                          {product.images.length > 1 && (
                            <span className={styles.photoCount}>{product.images.length} fotos</span>
                          )}
                        </div>

                        <div className={styles.productHeader}>
                          <div>
                            <small>{product.brand}</small>
                            <h3>{product.name}</h3>
                          </div>
                          <strong>{product.price}</strong>
                        </div>

                        <div className={styles.toggleRow}>
                          <span>Ver descripción</span>
                          <b aria-hidden="true">+</b>
                        </div>
                      </summary>

                      <div className={styles.detailsBody}>
                        <p>{product.description}</p>

                        {product.images.length > 1 && (
                          <div className={styles.gallery}>
                            {product.images.slice(1).map((image, index) => (
                              <img
                                key={image}
                                src={image}
                                alt={`${product.brand} ${product.name} vista ${index + 2}`}
                                loading="lazy"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <a
          className="button shop-all"
          href="https://wa.me/50671246337?text=Hola%2C%20quiero%20consultar%20por%20productos%20de%20Z%C3%A9nit%20Sal%C3%B3n"
          target="_blank"
          rel="noreferrer"
        >
          Consultar disponibilidad por WhatsApp →
        </a>
      </section>

      <footer>
        <div className="brand footer-brand">
          <img src="/logo-zenit.png" alt="" />
          <span><strong>Zénit</strong>Salón</span>
        </div>
        <div className="footer-contact" aria-label="Información de contacto">
          <p><strong>Teléfono y WhatsApp</strong>+506 7124-6337</p>
          <p><strong>Ubicación</strong>Dulce Nombre, Calle Sancho, San Carlos</p>
        </div>
        <p className="footer-copyright">© 2026 Zénit Salón</p>
      </footer>
    </main>
  );
}