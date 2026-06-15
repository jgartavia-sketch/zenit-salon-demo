const services = [
  "Corte y estilismo",
  "Coloración profesional",
  "Barbería premium",
  "Tratamientos capilares",
  "Uñas y estética",
  "Spa y bienestar",
];

export default function Services() {
  return (
    <section id="servicios" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#d4af37]">
          Servicios
        </p>

        <h2 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl">
          Belleza, precisión y experiencia en un solo lugar.
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10"
            >
              <div className="mb-8 h-12 w-12 rounded-full bg-[#d4af37]/20" />
              <h3 className="text-2xl font-bold">{service}</h3>
              <p className="mt-4 text-white/60">
                Servicio diseñado para elevar la imagen del cliente con atención
                personalizada, técnica profesional y una experiencia premium.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}