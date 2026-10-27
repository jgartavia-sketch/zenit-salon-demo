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

const API_URL = "/api/backend";
const WHATSAPP_NUMBER = "50671246337";

function formatPrice(value: number) {
  return `₡${value.toLocaleString("es-CR")}`;
}

export default function TiendaPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [catalogCategories, setCatalogCategories] =
    useState<ProductCategory[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [catalogError, setCatalogError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderKey, setOrderKey] = useState("");
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/catalog/products`, {
          cache: "no-store",
        });

        if (!response.ok) throw Error();

        const data = await response.json();
        if (Array.isArray(data.categories)) {
          setCatalogCategories(data.categories);
          try {
            const saved = JSON.parse(localStorage.getItem("zenit_cart") || "[]");
            const live: Product[] = data.categories.flatMap((c:ProductCategory)=>c.products);
            if(Array.isArray(saved))setCart(saved.slice(0,50).flatMap((item:{id?:string;quantity?:number})=>{
              const product=live.find(p=>p.id===item.id);
              if(!product || !product.available || !Number.isInteger(item.quantity) || !item.quantity || item.quantity<1)return [];
              const quantity=Math.min(99,item.quantity,product.stock ?? 99);return quantity>0?[{...product,quantity}]:[];
            }));
          }catch{localStorage.removeItem("zenit_cart");}
          setCartReady(true);
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
        setCatalogError("No se pudo cargar el catálogo vigente. Actualizá la página o contactá al salón.");
      }
    };

    void loadProducts();
  }, []);

  useEffect(()=>{if(cartReady)localStorage.setItem("zenit_cart",JSON.stringify(cart.map(i=>({id:i.id,quantity:i.quantity}))));},[cart,cartReady]);
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
    if (ordering || !product.available) return;

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
    if(ordering)return;
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
    if(ordering)return;
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const sendOrderToWhatsApp = async () => {
    if (!cart.length) return;

    setOrdering(true);setOrderMessage("");
    const key=orderKey || crypto.randomUUID();setOrderKey(key);
    try {
      const response=await fetch(`${API_URL}/api/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestKey:key,expectedTotal:subtotal,items:cart.map(i=>({slug:i.id,quantity:i.quantity}))})});
      const result=await response.json();if(!response.ok){if(response.status<500)setOrderKey("");throw Error(response.status===401?"Ingresá a tu cuenta para guardar el pedido.":result.error);}
      const order=result.order;
      const text=["Hola, Zénit Salón. Guardé mi pedido en el sitio.",`Pedido: ${order.id}`,...order.items.map((i:{quantity:number;name:string;subtotal:number})=>`${i.quantity} × ${i.name} — ${formatPrice(i.subtotal)}`),`Total: ${formatPrice(order.total)}`,"Quiero coordinar pago y entrega."].join("\n");
      setCart([]);setOrderKey("");setOrderMessage(`Pedido ${order.id.slice(0,8)} guardado. Consultalo en Mi cuenta.`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer");
    } catch(error){setOrderMessage(error instanceof Error?error.message:"No se pudo guardar. Reintentá: tu solicitud no se duplicará.");}
    finally{setOrdering(false);}

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

          {orderMessage && <p role="status" className={styles.checkoutNote}>{orderMessage} <Link href="/mi-cuenta">Mi cuenta</Link> · <Link href="/login">Ingresar</Link></p>}
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
                onClick={()=>void sendOrderToWhatsApp()}
                disabled={ordering}
              >
                {ordering ? "Guardando pedido…" : "Guardar y coordinar por WhatsApp"}
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

          {catalogError && <p role="alert">{catalogError}</p>}
          {!catalogError && !catalogCategories.length && <p>No hay productos disponibles en este momento.</p>}
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