"use client";
import { useEffect, useState } from "react";
import styles from "./calendar.module.css";
export type CalendarDay = {
  date: string;
  state: "available" | "full" | "closed" | "past" | "outside";
  availableSlots: number;
  totalSlots: number;
};
type CalendarAppointment = {
  id: string;
  customerName: string;
  startAt: string;
  status: string;
  services: { name: string }[];
  notes: string;
};
type Snapshot = {
  month: string;
  days: CalendarDay[];
  appointments?: CalendarAppointment[];
};
const labels: Record<CalendarDay["state"], string> = {
  available: "Disponible",
  full: "Sin cupos",
  closed: "Cerrado",
  past: "Pasado",
  outside: "Próximamente",
};
export function salonToday() {
  return new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
}
export function salonDateLabel(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("es-CR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
function shiftMonth(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}
export default function SalonCalendar({
  value,
  onChange,
  services = [],
  owner = false,
  revision = 0,
}: {
  value: string;
  onChange: (date: string) => void;
  services?: string[];
  owner?: boolean;
  revision?: number;
}) {
  const [month, setMonth] = useState(() => value.slice(0, 7));
  const [today] = useState(salonToday);
  const [lastMonth] = useState(() =>
    new Date(Date.now() + 90 * 86400000 - 6 * 3600000)
      .toISOString()
      .slice(0, 7),
  );
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const query = services.join(",");
  useEffect(() => {
    const controller = new AbortController();
    let live = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = owner
          ? `admin/calendar?month=${month}&owner=1`
          : `calendar?month=${month}${query ? `&services=${encodeURIComponent(query)}` : ""}`;
        const r = await fetch(`/api/backend/api/agenda/${endpoint}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const d = await r.json();
        if (!r.ok) throw Error(d.error || "No se pudo cargar la agenda.");
        if (live) setSnapshot(d);
      } catch (e) {
        if (live && !controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : "No se pudo cargar la agenda.",
          );
      } finally {
        if (live) setLoading(false);
      }
    };
    const start = setTimeout(() => void load(), 0);
    const timer = setInterval(() => void load(), 60000);
    return () => {
      live = false;
      clearTimeout(start);
      clearInterval(timer);
      controller.abort();
    };
  }, [month, query, owner, revision, refresh]);
  const title = new Date(`${month}-01T12:00:00Z`).toLocaleDateString("es-CR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
  const days = snapshot?.month === month ? snapshot.days : [];
  const events = snapshot?.month === month ? snapshot.appointments || [] : [];
  const offset = (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7;
  return (
    <section
      className={styles.calendar}
      aria-label={
        owner ? "Calendario privado del salón" : "Calendario de disponibilidad"
      }
    >
      <div className={styles.intro}>
        <div>
          <span className={styles.kicker}>
            {owner ? "AGENDA ZÉNIT" : "TU MOMENTO ZÉNIT"}
          </span>
          <h3>
            {owner
              ? "Un mes, todas tus citas."
              : "Encontrá tu próximo momento."}
          </h3>
        </div>
        <span className={styles.signature} aria-hidden="true">
          ✦
        </span>
      </div>
      <div className={styles.toolbar}>
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={
            (!owner && month <= today.slice(0, 7)) || month <= "2020-01"
          }
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          ‹
        </button>
        <strong aria-live="polite">{title}</strong>
        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={(!owner && month >= lastMonth) || month >= "2099-12"}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          ›
        </button>
      </div>
      <div className={styles.weekdays} aria-hidden="true">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className={styles.month} key={month} aria-busy={loading}>
        {Array.from({ length: offset }, (_, i) => (
          <span key={`empty-${i}`} className={styles.spacer} />
        ))}
        {days.map((day) => {
          const appointments = events.filter(
            (a) =>
              new Date(+new Date(a.startAt) - 6 * 3600000)
                .toISOString()
                .slice(0, 10) === day.date &&
              !["CANCELLED", "EXPIRED"].includes(a.status),
          );
          const selected = value === day.date;
          const blocked = !owner && ["past", "outside"].includes(day.state);
          return (
            <button
              type="button"
              key={day.date}
              className={`${styles.day} ${styles[day.state]} ${selected ? styles.selected : ""}`}
              disabled={blocked}
              aria-pressed={selected}
              aria-current={day.date === today ? "date" : undefined}
              aria-label={`${salonDateLabel(day.date)}: ${labels[day.state]}${owner ? `, ${appointments.length} citas o bloqueos` : ""}`}
              onClick={() => onChange(day.date)}
            >
              <span className={styles.dayTop}>
                <b>{Number(day.date.slice(8))}</b>
                {day.date === today && <i aria-label="Hoy" />}
              </span>
              <span className={styles.dayState}>
                <i />
                {labels[day.state]}
              </span>
              {owner && appointments.length > 0 && (
                <>
                  <span className={styles.count}>
                    {appointments.length}{" "}
                    {appointments.length === 1 ? "cita" : "citas"}
                  </span>
                  <span className={styles.previews}>
                    {appointments.slice(0, 2).map((a) => (
                      <span
                        key={a.id}
                        title={`${a.customerName} · ${a.services.map((s) => s.name).join(" + ") || a.notes || "Cita coordinada"}`}
                      >
                        <strong>
                          {new Date(a.startAt).toLocaleTimeString("es-CR", {
                            timeZone: "America/Costa_Rica",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}{" "}
                          · {a.customerName}
                        </strong>
                        <small>
                          {a.services.map((s) => s.name).join(" + ") ||
                            a.notes ||
                            "Cita coordinada"}
                        </small>
                      </span>
                    ))}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
      {!days.length && !error && (
        <p className={styles.feedback} role="status">
          Preparando tu calendario…
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.legend}>
        <span>
          <i className={styles.freeDot} />
          Disponible
        </span>
        <span>
          <i className={styles.busyDot} />
          Sin cupos
        </span>
        <span>
          <i className={styles.closedDot} />
          Cerrado
        </span>
      </div>
      <div className={styles.bottom}>
        <button
          type="button"
          onClick={() => {
            setMonth(today.slice(0, 7));
            onChange(today);
          }}
        >
          Hoy
        </button>
        <span>Hora de Costa Rica</span>
        <button
          type="button"
          disabled={loading}
          onClick={() => setRefresh((x) => x + 1)}
          aria-label="Actualizar calendario"
        >
          ↻ <span>Actualizar</span>
        </button>
      </div>
    </section>
  );
}
