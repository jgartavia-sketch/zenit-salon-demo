"use client";
import { useEffect, useState } from "react";
import SalonCalendar, { salonToday, salonDateLabel } from "./SalonCalendar";
import styles from "./agenda.module.css";
import calendar from "./calendar.module.css";
type Slot = { time: string; available: boolean };
export default function AvailabilityPicker({
  services,
  onReady,
}: {
  services: string[];
  onReady?: (ready: boolean) => void;
}) {
  const [date, setDate] = useState(salonToday);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<{ key: string; slots: Slot[] } | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const query = services.join(",");
  const key = `${date}:${query}`;
  useEffect(() => {
    const controller = new AbortController();
    let live = true;
    const load = async () => {
      setLoading(true);
      setMessage("");
      try {
        const r = await fetch(
          `/api/backend/api/agenda/availability?date=${date}${query ? `&services=${encodeURIComponent(query)}` : ""}`,
          { cache: "no-store", signal: controller.signal },
        );
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (live) {
          setResult({ key, slots: d.slots });
          if (d.bookingUnavailableReason)
            setMessage(d.bookingUnavailableReason);
          else if (!d.slots.length)
            setMessage(
              "Este día no tiene cupos habilitados. Elegí otro día del calendario.",
            );
        }
      } catch (e) {
        if (live && !controller.signal.aborted)
          setMessage(
            e instanceof Error
              ? e.message
              : "No se pudieron cargar los horarios.",
          );
      } finally {
        if (live) setLoading(false);
      }
    };
    const start = setTimeout(() => {
      setSelected("");
      void load();
    }, 0);
    const timer = setInterval(() => void load(), 60000);
    return () => {
      live = false;
      clearTimeout(start);
      clearInterval(timer);
      controller.abort();
    };
  }, [date, query, key, revision]);
  const slots = result?.key === key ? result.slots : [];
  const chosen = slots.some((s) => s.time === selected && s.available)
    ? selected
    : "";
  useEffect(() => {
    onReady?.(Boolean(chosen) && !loading && !message);
  }, [chosen, loading, message, onReady]);
  return (
    <div
      id="booking-availability"
      className={styles.availability}
      tabIndex={-1}
    >
      <SalonCalendar
        value={date}
        onChange={(d) => {
          setDate(d);
          setSelected("");
        }}
        services={services}
        revision={revision}
      />
      <input name="date" type="hidden" value={date} />
      <input name="time" type="hidden" value={chosen} />
      <section
        className={`${styles.panel} ${styles.compact}`}
        aria-label="Horarios disponibles"
      >
        <div className={styles.dayHeading}>
          <span className={calendar.kicker}>TU DÍA ELEGIDO</span>
          <h3>{salonDateLabel(date)}</h3>
          <p>
            {query
              ? "Horarios que alcanzan para tus servicios seleccionados."
              : "Disponibilidad general. Seleccioná tus servicios para calcular su duración."}
          </p>
        </div>
        {loading && <p role="status">Buscando tu mejor horario…</p>}
        {message && (
          <p role="alert" className={styles.error}>
            {message}
          </p>
        )}
        <div className={styles.grid}>
          {slots.map((s) => (
            <button
              key={s.time}
              type="button"
              disabled={!s.available}
              aria-pressed={chosen === s.time}
              className={chosen === s.time ? styles.chosen : ""}
              onClick={() => setSelected(s.time)}
            >
              {s.time}
              <br />
              <small>{s.available ? "Disponible" : "Ocupado"}</small>
            </button>
          ))}
        </div>
        <div className={styles.row}>
          <button type="button" onClick={() => setRevision((x) => x + 1)}>
            Actualizar cupos
          </button>
        </div>
        <p className={styles.privacy}>
          Consultá libremente. Para guardar una cita necesitás tu cuenta Zénit.
          Los datos de otros clientes son privados.
        </p>
      </section>
    </div>
  );
}
