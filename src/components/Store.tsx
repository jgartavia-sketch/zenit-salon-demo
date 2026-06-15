"use client";

import { useMemo, useState } from "react";

const whatsappNumber = "50662964881";

const products = [
  {
    id: 1,
    name: "Shampoo Profesional",
    description: "Limpieza profunda con acabado suave y brillante.",
    price: 12900,
  },
  {
    id: 2,
    name: "Tratamiento Reparador",
    description: "Ideal para cabello seco, teñido o maltratado.",
    price: 18900,
  },
  {
    id: 3,
    name: "Aceite Capilar Premium",
    description: "Brillo, control y nutrición con aroma elegante.",
    price: 15900,
  },
  {
    id: 4,
    name: "Kit Profesional Zenit",
    description: "Rutina completa para mantener el cabello impecable.",
    price: 29900,
  },
];

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Store() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  function addToCart(product: (typeof products)[number]) {
    setCart((currentCart) => {
      const existingProduct = currentCart.find((item) => item.id === product.id);

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(productId: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function sendOrderToWhatsapp() {
    const orderLines = cart
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - ${formatPrice(
            item.price * item.quantity
          )}`
      )
      .join("%0A");

    const message = `Hola, quiero hacer este pedido en Zenit:%0A%0A${orderLines}%0A%0ATotal: ${formatPrice(
      total
    )}%0A%0AMe gustaría coordinar la entrega o retiro.`;

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  }

  return (
    <section id="tienda" className="bg-[#070707] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#d4af37]">
          Tienda online
        </p>

        <h2 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl">
          Productos premium para continuar la experiencia en casa.
        </h2>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-5 md:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/20 text-2xl">
                  ✦
                </div>

                <h3 className="text-2xl font-bold">{product.name}</h3>

                <p className="mt-4 text-white/60">{product.description}</p>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <span className="text-xl font-black text-[#d4af37]">
                    {formatPrice(product.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="rounded-full bg-[#d4af37] px-5 py-3 text-xs font-bold uppercase tracking-widest text-black transition hover:bg-white"
                  >
                    Agregar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-[#d4af37]/30 bg-[#111111] p-8">
            <h3 className="text-2xl font-black">Pedido</h3>

            {cart.length === 0 ? (
              <p className="mt-6 text-white/60">
                Tu carrito está vacío. Elegí un producto y armamos el pedido.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-white/10 pb-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="mt-1 text-sm text-white/50">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm font-bold text-[#d4af37]"
                      >
                        −
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-3">
                  <span className="text-white/60">Total</span>
                  <span className="text-2xl font-black text-[#d4af37]">
                    {formatPrice(total)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={sendOrderToWhatsapp}
                  className="mt-4 w-full rounded-full bg-[#d4af37] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white"
                >
                  Finalizar por WhatsApp
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}