export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero/hero-zenit.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-black/50" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 42%, rgba(0,0,0,0.30) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pt-28">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.4em] text-[#d4af37]">
            Salón Premium · Barbería · Estética
          </p>

          <h1 className="text-5xl font-black tracking-[0.18em] text-white md:text-7xl">
            ZENIT
          </h1>

          <div className="mt-6 h-[2px] w-32 bg-[#d4af37]" />

          <p className="mt-8 text-3xl font-light leading-tight text-white md:text-5xl">
            Donde la belleza alcanza su punto más alto.
          </p>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/75">
            Reserva citas, descubre tratamientos exclusivos, compra productos
            profesionales y disfruta beneficios diseñados para nuestros
            clientes frecuentes.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#reservas"
              className="rounded-full bg-[#d4af37] px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-black transition hover:bg-white"
            >
              Reservar cita
            </a>

            <a
              href="#tienda"
              className="rounded-full border border-[#d4af37]/40 px-8 py-4 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              Ver tienda
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}