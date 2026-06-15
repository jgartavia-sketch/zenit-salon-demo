export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="#" className="text-2xl font-black tracking-[0.35em] text-[#d4af37]">
          ZENIT
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
          <a href="#inicio" className="transition hover:text-[#d4af37]">Inicio</a>
          <a href="#servicios" className="transition hover:text-[#d4af37]">Servicios</a>
          <a href="#cliente-frecuente" className="transition hover:text-[#d4af37]">Cliente frecuente</a>
          <a href="#tienda" className="transition hover:text-[#d4af37]">Tienda</a>
          <a href="#reservas" className="transition hover:text-[#d4af37]">Reservas</a>
        </div>

        <a
          href="#reservas"
          className="rounded-full border border-[#d4af37]/60 px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
        >
          Agendar
        </a>
      </nav>
    </header>
  );
}