"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import styles from "./agenda.module.css";
type Appointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  expiresAt: string | null;
  responseMessage?: string;
  proposedStartAt?: string | null;
  proposalAppointmentId?: string | null;
  services: { name: string }[];
};
type Order = {
  id: string;
  status: string;
  total: number;
  items: { name: string; quantity: number }[];
};
export const statusLabel: Record<string, string> = {
  PENDING: "Pendiente de confirmación",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  REFUNDED: "Devuelto",
  EXPIRED: "Vencida",
  BLOCKED: "Bloqueado",
};
export const localTime = (value: string) =>
  new Date(value).toLocaleString("es-CR", {
    timeZone: "America/Costa_Rica",
    dateStyle: "medium",
    timeStyle: "short",
  });
export default function MyActivity() {
  const focused = useRef(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const [a, o] = await Promise.all([
        fetch("/api/backend/api/agenda/mine", { cache: "no-store" }),
        fetch("/api/backend/api/orders/mine", { cache: "no-store" }),
      ]);
      if (!a.ok || !o.ok) throw Error("No se pudo actualizar tu actividad.");
      setAppointments((await a.json()).appointments);
      setOrders((await o.json()).orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar.");
    }
  }, []);
  useEffect(() => {
    const start = setTimeout(() => void load(), 0);
    const timer = setInterval(() => void load(), 60000);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [load]);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("appointment");
    if (!focused.current && id && appointments.some((a) => a.id === id)) {
      const timer = setTimeout(() => {
        document
          .getElementById(`appointment-${id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        focused.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [appointments]);
  async function cancel(kind: string, id: string) {
    if (!window.confirm("¿Querés cancelar esta solicitud?")) return;
    try {
      const r = await fetch(`/api/backend/api/${kind}/${id}/cancel`, {
        method: "PATCH",
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cancelar.");
    }
  }
  return (
    <section className={`${styles.panel} ${styles.activity}`}>
      <h2>Mis citas y pedidos</h2>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <h3>Mis citas</h3>
      {!appointments.length && <p>Todavía no tenés citas registradas.</p>}
      {appointments.map((a) => (
        <article id={`appointment-${a.id}`} key={a.id} className={styles.card}>
          <strong>{localTime(a.startAt)}</strong>
          <p>
            {a.services.map((s) => s.name).join(" + ") ||
              "Cita coordinada con el salón"}{" "}
            · {statusLabel[a.status]}
          </p>
          {a.responseMessage && (
            <p className={styles.note}>
              <strong>Mensaje de Zénit:</strong> {a.responseMessage}
            </p>
          )}
          {a.status === "CANCELLED" && a.proposedStartAt && (
            <div className={styles.proposal}>
              <strong>Otro momento para vos</strong>
              <p>{localTime(a.proposedStartAt)}</p>
              <p>
                El cupo se comprueba al aceptar. La nueva solicitud requiere
                confirmación.
              </p>
              {a.proposalAppointmentId ? (
                <p>Ya aceptaste esta propuesta. Revisá tu nueva solicitud.</p>
              ) : (
                <button
                  onClick={async (e) => {
                    const button = e.currentTarget;
                    button.disabled = true;
                    try {
                      const r = await fetch(
                        `/api/backend/api/agenda/appointments/${a.id}/accept-proposal`,
                        { method: "POST" },
                      );
                      const d = await r.json();
                      if (!r.ok) throw Error(d.error);
                      setError("");
                      await load();
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "No se pudo aceptar.",
                      );
                    } finally {
                      button.disabled = false;
                    }
                  }}
                >
                  Aceptar propuesta
                </button>
              )}
            </div>
          )}
          {a.status === "PENDING" && a.expiresAt && (
            <small>
              El espacio se aparta hasta {localTime(a.expiresAt)} mientras el
              salón confirma.
            </small>
          )}
          {["PENDING", "CONFIRMED"].includes(a.status) &&
            new Date(a.startAt) > new Date() && (
              <div className={styles.row}>
                <button
                  onClick={() => void cancel("agenda/appointments", a.id)}
                >
                  Cancelar cita
                </button>
              </div>
            )}
        </article>
      ))}
      <h3>Mis pedidos</h3>
      {!orders.length && <p>Todavía no tenés pedidos registrados.</p>}
      {orders.map((o) => (
        <article key={o.id} className={styles.card}>
          <strong>
            Pedido {o.id.slice(0, 8)} · ₡{o.total.toLocaleString("es-CR")}
          </strong>
          <p>
            {o.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")} ·{" "}
            {statusLabel[o.status]}
          </p>
          {o.status === "PENDING" && (
            <button onClick={() => void cancel("orders", o.id)}>
              Cancelar pedido
            </button>
          )}
        </article>
      ))}
      <button onClick={() => void load()}>Actualizar</button>
      <details>
        <summary>Cambiar contraseña</summary>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              const r = await fetch("/api/backend/api/auth/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  currentPassword: f.get("current"),
                  password: f.get("password"),
                }),
              });
              const d = await r.json();
              if (!r.ok) throw Error(d.error);
              window.location.assign(new URL("/login", window.location.origin));
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "No se pudo cambiar.",
              );
            }
          }}
        >
          <label>
            Contraseña actual
            <input
              name="current"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            Nueva contraseña (mínimo 12 caracteres)
            <input
              name="password"
              type="password"
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </label>
          <button>Guardar y cerrar sesiones</button>
        </form>
      </details>
    </section>
  );
}
