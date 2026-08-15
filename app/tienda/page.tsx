"use client";

import { useEffect, useMemo, useState } from "react";
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
  stock?: number | null;
  available: boolean;
};

type ProductCategory = {
  id: string;
  name: string;
  description?: string | null;
  products: Product[];
};

type CartItem = Product & {
  quantity: number;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const WHATSAPP_NUMBER = "50671246337";

const fallbackCategories: ProductCategory[] = [
  {
    id: "shampoo",
    name: "Shampoo",
    products: [
      {
        id: "yoorganic-moisturizing-shampoo",
        name: "Moisturizing Shampoo",
        brand: "YOORGANIC",
        category: "Shampoo",
        price: 1000,
        description:
          "Shampoo profesional de enfoque hidratante para cabello seco o sensibilizado. Ayuda a mantener una apariencia suave, manejable y con brillo dentro de la rutina capilar.",
        image: "/images/productos/yoorganic-moisturizing-shampoo.png",
        available: true,
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
        available: true,
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
        available: true,
      },
    ],
  },
  {
    id: "aceites-serums",
    name: "Aceites y sérums",
    products: [
      {
        id: "yoorganic-nourishing-oil",
        name: "Nourishing Oil",
        brand: "YOORGANIC",
        category: "Aceites y sérums",
        price: 1000,
        description:
          "Aceite capilar de acabado para medios y puntas. Ayuda a aportar brillo, suavidad y una apariencia más pulida dentro de la rutina diaria o profesional.",
        image: "/images/productos/yoorganic-nourishing-oil.png",
        available: true,
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
        available: true,
      },
    ],
  },
  {
    id: "tratamientos-productos",
    name: "Tratamientos",
    products: [
      {
        id: "yoorganic-protein-hair-repairing-liquid",
        name: "Protein Hair Repairing Liquid",
        brand: "YOORGANIC",
        category: "Tratamientos",
        price: 1000,
        description:
          "Tratamiento capilar líquido orientado al cuidado del cabello sensibilizado. Puede integrarse a una rutina profesional enfocada en mejorar suavidad, apariencia y manejabilidad.",
        image: "/images/productos/yoorganic-protein-hair-repairing-liquid.png",
        available: true,
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
        available: true,
      },
    ],
  },
  {
    id: "proteccion-termica",
    name: "Protección térmica",
    products: [
      {
        id: "wella-eimi-thermal-image",
        name: "EIMI Thermal Image",
        brand: "Wella Professionals",
        category: "Protección térmica",
        price: 1000,
        description:
          "Spray de protección térmica diseñado para utilizarse antes del estilizado con herramientas de calor. Complementa el peinado profesional y ayuda a mantener un acabado pulido.",
        image: "/images/productos/wella-eimi-thermal-image.png",
        available: true,
      },
    ],
  },
];

function formatPrice(value: number) {
  return `₡${value.toLocaleString("es-CR")}`;
}

export default function TiendaPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [catalogCategories, setCatalogCategories] =
    useState<ProductCategory[]>(fallbackCategories);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        fallbackCategories.flatMap((category) =>
          category.products.map((product) => [product.id, 1]),
        ),
      ),
  );

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/catalog/products`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCatalogCategories(data.categories);
          setSelectedQuantities((current) => {
            const next = { ...current };
            for (const category of data.categories as ProductCategory[]) {
              for (const product of category.products) {
                if (!next[product.id]) next[product.id] = 1;
              }
            }
            return next;
          });
        }
      } catch {
        // El catálogo embebido conserva la tienda operativa
        // si el backend no está disponible temporalmente.
      }
    };

    void loadProducts();
  }, []);

  const products = useMemo(
    () => catalogCategories.flatMap((category) => category.products),
    [catalogCategories],
  );

  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  const maxQuantityFor = (product: Product) => {
    if (typeof product.stock === "number") {
      return Math.max(0, Math.min(99, product.stock));
    }
    return 99;
  };

  const changeSelectedQuantity = (product: Product, amount: number) => {
    const max = Math.max(1, maxQuantityFor(product));
    setSelectedQuantities((current) => ({
      ...current,
      [product.id]: Math.max(
        1,
        Math.min(max, (current[product.id] || 1) + amount),
      ),
    }));
  };

  const addToCart = (product: Product) => {
    if (!product.available) return;

    const max = maxQuantityFor(product);
    if (max <= 0) return;

    const quantityToAdd = Math.min(
      selectedQuantities[product.id] || 1,
      max,
    );

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantityToAdd, max),
              }
            : item,
        );
      }

      return [...current, { ...product, quantity: quantityToAdd }];
    });

    setCartOpen(true);
    setMenuOpen(false);
  };

  const changeQuantity = (productId: string, amount: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== productId) return item;
          const max = Math.max(1, maxQuantityFor(item));
          return {
            ...item,
            quantity: Math.min(max, item.quantity + amount),
          };
        })
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

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  };

  return (
    <main className={cartOpen ? styles.cartLayoutOpen : ""}>
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
          onClick={() => {
            setMenuOpen((open) => !open);
            setCartOpen(false);
          }}
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
          <Link className="active" href="/tienda" onClick={() => setMenuOpen(false)}>Tienda</Link>
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link href="/reservar" onClick={() => setMenuOpen(false)}>Reservar</Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className={styles.headerCartButton}
            onClick={() => {
              setCartOpen((open) => !open);
              setMenuOpen(false);
            }}
            aria-label={`${cartOpen ? "Cerrar" : "Abrir"} carrito, ${totalItems} productos`}
            aria-expanded={cartOpen}
          >
            Carrito
            <span>{totalItems}</span>
          </button>

          <Link className="button button-small" href="/reservar">
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
              <button
                type="button"
                className={styles.continueShoppingButton}
                onClick={() => setCartOpen(false)}
              >
                Seguir comprando
              </button>
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

              <button
                type="button"
                className={styles.continueShoppingButton}
                onClick={() => setCartOpen(false)}
              >
                Seguir comprando
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
            {catalogCategories.map((category) => {
              const isCategoryOpen = Boolean(openCategories[category.id]);

              return (
                <section
                  className={`${styles.categorySection} ${isCategoryOpen ? styles.categoryOpen : ""}`}
                  key={category.id}
                >
                  <button
                    type="button"
                    className={styles.categoryToggle}
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={isCategoryOpen}
                  >
                    <div className={styles.categoryHeading}>
                      <span>✦</span>
                      <div>
                        <p>Categoría</p>
                        <h2>{category.name}</h2>
                      </div>
                    </div>

                    <div className={styles.categoryMeta}>
                      <span className={styles.viewProductsLabel}>
                        {isCategoryOpen ? "Ocultar productos" : "Ver productos"}
                      </span>
                      <b aria-hidden="true">+</b>
                    </div>
                  </button>

                  <div className={styles.categoryContent} aria-hidden={!isCategoryOpen}>
                    <div className={styles.productGrid}>
                    {category.products.map((product) => {
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
                                  onClick={() => changeSelectedQuantity(product, -1)}
                                  aria-label={`Reducir cantidad de ${product.name}`}
                                  disabled={!product.available}
                                >
                                  −
                                </button>
                                <span>{selectedQuantity}</span>
                                <button
                                  type="button"
                                  onClick={() => changeSelectedQuantity(product, 1)}
                                  aria-label={`Aumentar cantidad de ${product.name}`}
                                  disabled={!product.available}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                className={styles.addButton}
                                onClick={() => addToCart(product)}
                                disabled={!product.available}
                              >
                                {product.available ? "Agregar" : "No disponible"}
                                <span aria-hidden="true">＋</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    </div>
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