export default function Loyalty() {
  return (
    <section
      id="cliente-frecuente"
      className="bg-[#0d0d0d] px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#d4af37]">
          Cliente frecuente
        </p>

        <h2 className="mt-4 text-4xl font-black md:text-6xl">
          Cada visita tiene recompensa.
        </h2>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#d4af37]/30 bg-[#111111] p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Tarjeta Digital
            </p>

            <h3 className="mt-4 text-3xl font-bold">
              ZENIT Rewards
            </h3>

            <p className="mt-6 text-white/70">
              Acumulá puntos con cada visita, participá en promociones
              exclusivas y recibí beneficios especiales por tu fidelidad.
            </p>

            <div className="mt-10 rounded-2xl border border-[#d4af37]/20 bg-black p-6">
              <p className="text-sm text-white/50">
                Cliente
              </p>

              <p className="mt-2 text-xl font-bold">
                María González
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-white/60">
                  Puntos acumulados
                </span>

                <span className="text-3xl font-black text-[#d4af37]">
                  850
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="rounded-2xl border border-white/10 p-6">
              <h4 className="font-bold">
                Registro mediante QR
              </h4>

              <p className="mt-2 text-white/60">
                Los clientes pueden registrarse en segundos desde su teléfono.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-6">
              <h4 className="font-bold">
                Acumulación automática de puntos
              </h4>

              <p className="mt-2 text-white/60">
                Cada compra suma beneficios sin necesidad de tarjetas físicas.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 p-6">
              <h4 className="font-bold">
                Promociones personalizadas
              </h4>

              <p className="mt-2 text-white/60">
                Ofertas exclusivas para clientes recurrentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}