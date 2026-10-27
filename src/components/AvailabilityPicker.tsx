"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./agenda.module.css";
type Slot = { time: string; available: boolean };
export default function AvailabilityPicker({
  services,
}: {
  services: string[];
}) {
  const [date, setDate] = useState(() =>
    new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10),
  );
  const [selected, setSelected] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [message, setMessage] = useState("");
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const [minDate] = useState(() =>
    new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10),
  );
  const query = services.join(",");
  useEffect(() => {
    const abort = new AbortController();
    const start = setTimeout(() => {
      setSelected("");
      setSlots([]);
      setLogin(false);
      setMessage("");
      if (!query) return;
      setLoading(true);
      fetch(
        `/api/backend/api/agenda/availability?date=${date}&services=${encodeURIComponent(query)}`,
        { cache: "no-store", signal: abort.signal },
      )
        .then(async (r) => {
          const d = await r.json();
          if (r.status === 401) setLogin(true);
          if (!r.ok) throw Error(d.error);
          setSlots(d.slots);
          if (!d.slots.length)
            setMessage(
              "No hay cupos habilitados para estos servicios en esta fecha. Probá otro día.",
            );
        })
        .catch((e) => {
          if (e.name !== "AbortError")
            setMessage(e.message || "No se pudo cargar la agenda.");
        })
        .finally(() => {
          if (!abort.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(start);
      abort.abort();
    };
  }, [date, query, revision]);
  return (
    <section
      className={`${styles.panel} ${styles.compact}`}
      aria-label="Disponibilidad del salón"
    >
      <label>
        Elegí tu fecha
        <input
          name="date"
          type="date"
          min={minDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <input name="time" type="hidden" value={selected} />
      <p>Hora de Costa Rica · Disponible / Ocupado</p>
      {!query && <p>Seleccioná un servicio para ver los cupos.</p>}
      {loading && <p role="status">Consultando agenda…</p>}
      {message && (
        <p role="status" className={styles.note}>
          {message}
        </p>
      )}
      {login && (
        <Link href="/login">
          Ingresar o crear mi cuenta para consultar la agenda →
        </Link>
      )}
      <div className={styles.grid}>
        {slots.map((s) => (
          <button
            key={s.time}
            type="button"
            disabled={!s.available}
            aria-pressed={selected === s.time}
            className={selected === s.time ? styles.chosen : ""}
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
      <p>
        Solo se muestra disponibilidad. Tus datos y los de otras personas
        permanecen privados.
      </p>
    </section>
  );
}
