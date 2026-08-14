"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./tienda.module.css";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

const WHATSAPP_NUMBER = "50671246337";

const products: Product[] = [
  {
    id: "yoorganic-moisturizing-shampoo",
    name: "Moisturizing Shampoo",
    brand: "YOORGANIC",
    category: "Shampoo",
    price: 1000,
    description:
      "Shampoo profesional de enfoque hidratante para cabello seco o sensibilizado. Ayuda a mantener una apariencia suave, manejable y con brillo dentro de la rutina capilar.",
    image: "/images/productos/yoorganic-moisturizing-shampoo.png",
  },
  {
    id: "yoorganic-nourishing-shampoo",
    name: "Nourishing Shampoo",
    brand: "YOORGANIC",
    category: "Shampoo",
    price: 1000,
    description:
      "Shampoo nutritivo para complementar rutinas de cuidado profesional, especialmente en cabellos que necesitan suavidad, manejabilidad y una apariencia saludable.",
    image: "/images/productos/yoorganic-nourishing-shampoo.png",
  },
  {
    id: "nevada-silver-shampoo",
    name: "Silver Shampoo",
    brand: "Nevada Professional",
    category: "Shampoo",
    price: 1000,
    description:
      "Shampoo tipo silver pensado para el mantenimiento cosmético de cabellos claros, grises o decolorados. Ideal para una rutina de cuidado orientada a mantener una apariencia fría y uniforme.",
    image: "/images/productos/nevada-silver-shampoo.png",
  },
  {
    id: "yoorganic-nourishing-oil",
    name: "Nourishing Oil",
    brand: "YOORGANIC",
    category: "Aceites y sérums",
    price: 1000,
    description:
      "Aceite capilar de acabado para medios y puntas. Ayuda a aportar brillo, suavidad y una apariencia más pulida dentro de la rutina diaria o profesional.",
    image: "/images/productos/yoorganic-nourishing-oil.png",
  },
  {
    id: "karseell-maca-essence-oil",
    name: "Maca Essence Oil",
    brand: "Karseell",
    category: "Aceites y sérums",
    price: 1000,
    description:
      "Aceite capilar pensado para aportar nutrición, brillo, hidratación y control del frizz. Puede aplicarse principalmente en medios y puntas para complementar el acabado del cabello.",
    image: "/images/productos/karseell-maca-essence-oil.png",
  },
  {
    id: "yoorganic-protein-hair-repairing-liquid",
    name: "Protein Hair Repairing Liquid",
    brand: "YOORGANIC",
    category: "Tratamientos",
    price: 1000,
    description:
      "Tratamiento capilar líquido orientado al cuidado del cabello sensibilizado. Puede integrarse a una rutina profesional enfocada en mejorar suavidad, apariencia y manejabilidad.",
    image: "/images/productos/yoorganic-protein-hair-repairing-liquid.png",
  },
  {
    id: "nevada-leave-in-thermoactive",
    name: "Leave-in Thermoactive",
    brand: "Nevada Professional",
    category: "Tratamientos",
    price: 1000,
    description:
      "Tratamiento sin enjuague pensado para acompañar el peinado y la preparación del cabello antes del secado o del uso de herramientas térmicas.",
    image: "/images/productos/nevada-leave-in-thermoactive.png",
  },
  {
    id: "wella-eimi-thermal-image",
    name: "EIMI Thermal Image",
    brand: "Wella Professionals",
    category: "Protección térmica",
    price: 1000,
    description:
      "Spray de protección térmica diseñado para utilizarse antes del estilizado con herramientas de calor. Complementa el peinado profesional y ayuda a mantener un acabado pulido.",
    image: "/images/productos/wella-eimi-thermal-image.png",
  },
];

const categories = [
  "Shampoo",
  "Aceites y sérums",
  "Tratamientos",
  "Protección térmica",
];

function formatPrice(value: number) {
  return `₡${value.toLocaleString("es-CR")}`;
}

export default function TiendaPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(products.map((product) => [product.id, 1])),
  );

  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  const changeSelectedQuantity = (productId: string, amount: number) => {
    setSelectedQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, Math.min(99, (current[productId] || 1) + amount)),
    }));
  };

  const addToCart = (product: Product) => {
    const quantityToAdd = selectedQuantities[product.id] || 1;

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item,
        );
      }

      return [...current, { ...product, quantity: quantityToAdd }];
    });

    setCartOpen(true);
  };

  const changeQuantity = (productId: string, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const sendOrderToWhatsApp = () => {
    if (!cart.length) return;

    const productLines = cart.map(
      (item) =>
        `• ${item.quantity} x ${item.brand} ${item.name} — ${formatPrice(
          item.price * item.quantity,
        )}`,
    );

    const message = [
      "Hola, Zénit Salón. Quiero realizar este pedido:",
      "",
      ...productLines,
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      "",
      "Por favor confirmen disponibilidad y forma de entrega o retiro.",
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className={cartOpen ? styles.cartLayoutOpen : ""}>
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
          <button
            type="button"
            className={styles.headerCartButton}
            onClick={() => setCartOpen((open) => !open)}
            aria-label={`${cartOpen ? "Cerrar" : "Abrir"} carrito, ${totalItems} productos`}
            aria-expanded={cartOpen}
          >
            Carrito
            <span>{totalItems}</span>
          </button>

          <Link className="button button-small" href="/servicios#solicitar-servicio">
            Reservar
          </Link>

          <Link className="account-link" href="/login">
            Ingresar
          </Link>
        </div>
      </header>

      {cartOpen && (
        <aside
          className={styles.cartDrawer}
          role="dialog"
          aria-label="Carrito de compras"
        >
          <div className={styles.cartHeader}>
            <div>
              <small>Tienda Zénit</small>
              <h2>Tu carrito</h2>
            </div>

            <button
              type="button"
              className={styles.closeCart}
              onClick={() => setCartOpen(false)}
              aria-label="Cerrar carrito"
            >
              ×
            </button>
          </div>

          {!cart.length ? (
            <div className={styles.emptyCart}>
              <span>✦</span>
              <h3>Tu carrito está vacío</h3>
              <p>Agregá productos para preparar el pedido.</p>
            </div>
          ) : (
            <>
              <div className={styles.cartList}>
                {cart.map((item) => (
                  <article className={styles.cartItem} key={item.id}>
                    <img
                      src={item.image}
                      alt={`${item.brand} ${item.name}`}
                    />

                    <div className={styles.cartItemInfo}>
                      <small>{item.brand}</small>
                      <h3>{item.name}</h3>
                      <strong>{formatPrice(item.price)}</strong>

                      <div className={styles.quantity}>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label={`Reducir cantidad de ${item.name}`}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Eliminar ${item.name} del carrito`}
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>

              <div className={styles.cartTotal}>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <button
                type="button"
                className={styles.whatsappCheckout}
                onClick={sendOrderToWhatsApp}
              >
                Enviar pedido por WhatsApp
                <span aria-hidden="true">→</span>
              </button>

              <p className={styles.checkoutNote}>
                El pedido se enviará al WhatsApp oficial de Zénit Salón para
                confirmar existencias y coordinar entrega o retiro.
              </p>
            </>
          )}
        </aside>
      )}

      <div className={styles.storeContent}>
        <section className={`section shop page-section ${styles.shopPage}`} id="tienda">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> Tienda Zénit</p>
              <h2>Productos profesionales para prolongar tu experiencia.</h2>
            </div>
            <p>
              Elegí cantidad, agregá tus productos al carrito y enviá el pedido
              directamente al WhatsApp oficial de Zénit Salón.
            </p>
          </div>

          <div className={styles.catalog}>
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (product) => product.category === category,
              );

              return (
                <section className={styles.categorySection} key={category}>
                  <div className={styles.categoryHeading}>
                    <span>✦</span>
                    <div>
                      <p>Categoría</p>
                      <h2>{category}</h2>
                    </div>
                  </div>

                  <div className={styles.productGrid}>
                    {categoryProducts.map((product) => {
                      const selectedQuantity = selectedQuantities[product.id] || 1;

                      return (
                        <article className={styles.productCard} key={product.id}>
                          <div className={styles.imageStage}>
                            <img
                              src={product.image}
                              alt={`${product.brand} ${product.name}`}
                              loading="lazy"
                            />
                          </div>

                          <div className={styles.productInfo}>
                            <small>{product.brand}</small>
                            <h3>{product.name}</h3>
                            <strong>{formatPrice(product.price)}</strong>
                            <details className={styles.productDescription}>
                              <summary>
                                <span>Ver descripción</span>
                                <b aria-hidden="true">+</b>
                              </summary>
                              <div>
                                <p>{product.description}</p>
                              </div>
                            </details>

                            <div className={styles.purchaseRow}>
                              <div
                                className={styles.cardQuantity}
                                aria-label={`Cantidad de ${product.name}`}
                              >
                                <button
                                  type="button"
                                  onClick={() => changeSelectedQuantity(product.id, -1)}
                                  aria-label={`Reducir cantidad de ${product.name}`}
                                >
                                  −
                                </button>
                                <span>{selectedQuantity}</span>
                                <button
                                  type="button"
                                  onClick={() => changeSelectedQuantity(product.id, 1)}
                                  aria-label={`Aumentar cantidad de ${product.name}`}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                className={styles.addButton}
                                onClick={() => addToCart(product)}
                              >
                                Agregar
                                <span aria-hidden="true">＋</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
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
      </div>
    </main>
  );
}