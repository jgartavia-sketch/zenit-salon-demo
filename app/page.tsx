import Navbar from "@/src/components/Navbar";
import Hero from "@/src/components/Hero";
import Services from "@/src/components/Services";
import Loyalty from "@/src/components/Loyalty";
import Store from "@/src/components/Store";
import Booking from "@/src/components/Booking";


export default function Home() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <Navbar />
      <Hero />
      <Services />
      <Loyalty />
      <Store />
      <Booking />
    </main>
  );
}