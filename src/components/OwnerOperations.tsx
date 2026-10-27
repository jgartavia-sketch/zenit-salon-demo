"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./agenda.module.css";
import { localTime, statusLabel } from "./MyActivity";
type Range = { start: string; end: string };
type Week = { day: number; ranges: Range[] };
type Settings = {
  weekly: Week[];
  overrides: { date: string; ranges: Range[] }[];
  holdHours: number;
  noticeMinutes: number;
};
type Appointment = {
  id: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  startAt: string;
  endAt: string;
  status: string;
  notes: string;
  services: { name: string }[];
};
type Service = {
  id: string;
  name: string;
  durationMinutes: number | null;
  mode: string;
};
type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  customer?: { name: string; phone: string };
  items: { name: string; quantity: number }[];
};
const days = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const today = () =>
  new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
async function api(path: string, method = "GET", body?: unknown) {
  const r = await fetch(
    `/api/backend/api/${path}${path.includes("?") ? "&" : "?"}owner=1`,
    {
      method,
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "No se pudo completar la operación.");
  return d;
}
export default function OwnerOperations() {
  const [tab, setTab] = useState("agenda");
  const [date, setDate] = useState(today);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const [a, s, v, o] = await Promise.all([
      api(`agenda/appointments?date=${date}`),
      api("agenda/settings"),
      api("agenda/services"),
      api("orders"),
    ]);
    setAppointments(a.appointments);
    setSettings((current) => current || s.settings);
    setServices(v.services);
    setOrders(o.orders);
  }, [date]);
  useEffect(() => {
    const timer = setTimeout(
      () => void load().catch((e) => setError(e.message)),
      0,
    );
    return () => clearTimeout(timer);
  }, [load]);
  // Refresh only live lists; never overwrite unsaved schedule settings.
  useEffect(() => {
    const timer = setInterval(() => {
      void Promise.all([api(`agenda/appointments?date=${date}`), api("orders")])
        .then(([a, o]) => {
          setAppointments(a.appointments);
          setOrders(o.orders);
        })
        .catch(() => {});
    }, 60000);
    return () => clearInterval(timer);
  }, [date]);
  async function run(
    action: () => Promise<unknown>,
    success = "Cambios guardados.",
  ) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await action();
      await load();
      setMessage(success);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar.");
    } finally {
      setBusy(false);
    }
  }
  function updateDay(day: number, ranges: Range[]) {
    if (settings)
      setSettings({
        ...settings,
        weekly: [
          ...settings.weekly.filter((w) => w.day !== day),
          { day, ranges },
        ],
      });
  }
  function manual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void run(
      () =>
        api("agenda/manual", "POST", {
          date: f.get("date"),
          time: f.get("time"),
          durationMinutes: Number(f.get("duration")),
          customerName: f.get("name"),
          phone: f.get("phone"),
          notes: f.get("notes"),
          ...(f.get("customerEmail")
            ? { customerEmail: f.get("customerEmail") }
            : {}),
          blocked: f.get("blocked") === "on",
          requestKey: crypto.randomUUID(),
        }),
      "Cupo guardado en la agenda.",
    );
  }
  return (
    <section className={styles.panel} aria-label="Operación del salón">
      <h2>Mi agenda y pedidos</h2>
      <nav className={styles.tabs} aria-label="Operación">
        <button
          className={tab === "agenda" ? styles.chosen : ""}
          onClick={() => setTab("agenda")}
        >
          Mi agenda
        </button>
        <button
          className={tab === "schedule" ? styles.chosen : ""}
          onClick={() => setTab("schedule")}
        >
          Abrir horarios
        </button>
        <button
          className={tab === "orders" ? styles.chosen : ""}
          onClick={() => setTab("orders")}
        >
          Pedidos
        </button>
        <button
          className={tab === "account" ? styles.chosen : ""}
          onClick={() => setTab("account")}
        >
          Mi acceso
        </button>
      </nav>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {message && (
        <p role="status" className={styles.note}>
          {message}
        </p>
      )}
      {tab === "agenda" && (
        <>
          <div className={styles.row}>
            <label>
              Ver día
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <button
              disabled={busy}
              onClick={() => void run(load, "Agenda actualizada.")}
            >
              Actualizar
            </button>
          </div>
          <details>
            <summary>＋ Agregar cita o bloquear horario</summary>
            <form onSubmit={manual}>
              <div className={styles.row}>
                <label>
                  Fecha
                  <input
                    name="date"
                    type="date"
                    defaultValue={date}
                    min={today()}
                    required
                  />
                </label>
                <label>
                  Inicio
                  <input name="time" type="time" required />
                </label>
                <label>
                  Duración en minutos
                  <input
                    name="duration"
                    type="number"
                    min={15}
                    max={720}
                    step={15}
                    defaultValue={60}
                    required
                  />
                </label>
              </div>
              <div className={styles.row}>
                <label>
                  Cliente o motivo del bloqueo
                  <input name="name" required minLength={2} maxLength={100} />
                </label>
                <label>
                  WhatsApp
                  <input name="phone" type="tel" maxLength={30} />
                </label>
              </div>
              <label>
                Correo del cliente registrado (opcional)
                <input
                  name="customerEmail"
                  type="email"
                  placeholder="Vincula la cita a su cuenta"
                />
              </label>
              <label>
                Detalle del servicio o notas
                <textarea name="notes" maxLength={1000} />
              </label>
              <label>
                <span>
                  <input name="blocked" type="checkbox" /> Es un bloqueo o
                  descanso
                </span>
              </label>
              <button disabled={busy}>Guardar cupo</button>
            </form>
          </details>
          {!appointments.length && <p>No hay citas para este día.</p>}
          {appointments.map((a) => (
            <article key={a.id} className={styles.card}>
              <strong>
                {localTime(a.startAt)} —{" "}
                {new Date(a.endAt).toLocaleTimeString("es-CR", {
                  timeZone: "America/Costa_Rica",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              <p>
                {a.customerName} · {statusLabel[a.status]}
              </p>
              <p>
                {a.services.map((s) => s.name).join(" + ")} {a.notes}
              </p>
              {a.phone && (
                <a
                  href={`https://wa.me/${a.phone.replace(/\D/g, "").length === 8 ? "506" : ""}${a.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contactar por WhatsApp
                </a>
              )}
              <div className={styles.row}>
                {a.status === "PENDING" && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () =>
                          api(`agenda/appointments/${a.id}`, "PATCH", {
                            status: "CONFIRMED",
                          }),
                        "Cita confirmada.",
                      )
                    }
                  >
                    Confirmar
                  </button>
                )}
                {a.status === "CONFIRMED" && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void run(() =>
                        api(`agenda/appointments/${a.id}`, "PATCH", {
                          status: "COMPLETED",
                        }),
                      )
                    }
                  >
                    Marcar completada
                  </button>
                )}
                {["PENDING", "CONFIRMED", "BLOCKED"].includes(a.status) && (
                  <button
                    className={styles.danger}
                    disabled={busy}
                    onClick={() => {
                      if (confirm("¿Cancelar y liberar este cupo?"))
                        void run(() =>
                          api(`agenda/appointments/${a.id}`, "PATCH", {
                            status: "CANCELLED",
                          }),
                        );
                    }}
                  >
                    Cancelar / liberar
                  </button>
                )}
              </div>
              {["PENDING", "CONFIRMED"].includes(a.status) && (
                <details>
                  <summary>Reprogramar cita</summary>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void run(() =>
                        api(`agenda/appointments/${a.id}`, "PATCH", {
                          date: f.get("date"),
                          time: f.get("time"),
                          durationMinutes: Number(f.get("duration")),
                        }),
                      );
                    }}
                  >
                    <div className={styles.row}>
                      <input
                        name="date"
                        aria-label="Nueva fecha"
                        type="date"
                        min={today()}
                        required
                      />
                      <input
                        name="time"
                        aria-label="Nueva hora"
                        type="time"
                        required
                      />
                      <input
                        name="duration"
                        aria-label="Duración"
                        type="number"
                        min={15}
                        max={720}
                        defaultValue={
                          (+new Date(a.endAt) - +new Date(a.startAt)) / 60000
                        }
                        required
                      />
                      <button disabled={busy}>Mover cita</button>
                    </div>
                  </form>
                </details>
              )}
            </article>
          ))}
        </>
      )}
      {tab === "schedule" && settings && (
        <>
          <h3>Tu semana habitual</h3>
          <p>
            Activá cada día y elegí sus horarios. Agregá dos turnos si querés
            dejar una pausa para almorzar. Los días desactivados permanecen
            cerrados.
          </p>
          <div className={styles.week}>
            {days.map((name, day) => {
              const ranges =
                settings.weekly.find((w) => w.day === day)?.ranges || [];
              return (
                <div key={day} className={styles.weekDay}>
                  <label>
                    <span>
                      <input
                        type="checkbox"
                        checked={ranges.length > 0}
                        onChange={(e) =>
                          updateDay(
                            day,
                            e.target.checked
                              ? [{ start: "09:00", end: "17:00" }]
                              : [],
                          )
                        }
                      />{" "}
                      {name}
                    </span>
                  </label>
                  {ranges.map((r, i) => (
                    <div className={styles.row} key={i}>
                      <label>
                        Desde
                        <input
                          type="time"
                          value={r.start}
                          onChange={(e) =>
                            updateDay(
                              day,
                              ranges.map((v, n) =>
                                n === i ? { ...v, start: e.target.value } : v,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Hasta
                        <input
                          type="time"
                          value={r.end}
                          onChange={(e) =>
                            updateDay(
                              day,
                              ranges.map((v, n) =>
                                n === i ? { ...v, end: e.target.value } : v,
                              ),
                            )
                          }
                        />
                      </label>
                      <button
                        onClick={() =>
                          updateDay(
                            day,
                            ranges.filter((_, n) => n !== i),
                          )
                        }
                      >
                        Quitar turno
                      </button>
                    </div>
                  ))}
                  {ranges.length > 0 && ranges.length < 8 && (
                    <button
                      onClick={() =>
                        updateDay(day, [
                          ...ranges,
                          { start: "18:00", end: "20:00" },
                        ])
                      }
                    >
                      ＋ Otro turno
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.row}>
            <label>
              Anticipación mínima (minutos)
              <input
                type="number"
                min={0}
                max={10080}
                value={settings.noticeMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    noticeMinutes: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Confirmar solicitudes antes de (horas)
              <input
                type="number"
                min={1}
                max={48}
                value={settings.holdHours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    holdHours: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              void run(
                () =>
                  api("agenda/settings", "PUT", {
                    weekly: settings.weekly,
                    overrides: settings.overrides,
                    holdHours: settings.holdHours,
                    noticeMinutes: settings.noticeMinutes,
                  }),
                "Horarios publicados.",
              )
            }
          >
            Guardar horarios
          </button>
          <h3 style={{ marginTop: 24 }}>Un día diferente</h3>
          <p>
            La excepción reemplaza el horario habitual de esa fecha. Podés
            cerrar un día completo o abrir un horario especial.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const date = String(f.get("date"));
              const closed = f.get("closed") === "on";
              setSettings({
                ...settings,
                overrides: [
                  ...settings.overrides.filter((x) => x.date !== date),
                  {
                    date,
                    ranges: closed
                      ? []
                      : [
                          {
                            start: String(f.get("start")),
                            end: String(f.get("end")),
                          },
                        ],
                  },
                ],
              });
              setMessage(
                "Excepción preparada. Pulsá Guardar horarios para publicarla.",
              );
            }}
          >
            <div className={styles.row}>
              <label>
                Fecha
                <input name="date" type="date" min={today()} required />
              </label>
              <label>
                Desde
                <input name="start" type="time" defaultValue="09:00" required />
              </label>
              <label>
                Hasta
                <input name="end" type="time" defaultValue="17:00" required />
              </label>
              <label>
                <span>
                  <input name="closed" type="checkbox" /> Cerrar todo el día
                </span>
              </label>
              <button>Preparar excepción</button>
            </div>
          </form>
          {settings.overrides.map((x) => (
            <div className={styles.row} key={x.date}>
              <span>
                {x.date}:{" "}
                {x.ranges.length
                  ? x.ranges.map((r) => `${r.start}–${r.end}`).join(", ")
                  : "Cerrado"}
              </span>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    overrides: settings.overrides.filter(
                      (v) => v.date !== x.date,
                    ),
                  })
                }
              >
                Quitar excepción
              </button>
            </div>
          ))}
          <h3>Duración de los servicios</h3>
          <p>
            Configurá cada duración antes de abrir reservas. Los servicios
            cotizados se agendan manualmente con el tiempo acordado.
          </p>
          {services.map((s) => (
            <form
              key={s.id}
              className={styles.row}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void run(() =>
                  api(`agenda/services/${s.id}`, "PATCH", {
                    durationMinutes: Number(f.get("duration")),
                  }),
                );
              }}
            >
              <label>
                {s.name}
                <input
                  name="duration"
                  type="number"
                  min={15}
                  max={720}
                  defaultValue={s.durationMinutes || ""}
                  placeholder="Minutos"
                  required
                />
              </label>
              <button disabled={busy}>Guardar duración</button>
            </form>
          ))}
        </>
      )}
      {tab === "orders" && (
        <>
          <h3>Pedidos de la tienda</h3>
          <p>
            Los pedidos pendientes apartan existencias. Cancelarlos devuelve sus
            unidades al inventario. Registrá los puntos una sola vez con la
            referencia de factura.
          </p>
          {!orders.length && <p>No hay pedidos todavía.</p>}
          {orders.map((o) => (
            <article key={o.id} className={styles.card}>
              <strong>
                {o.customer?.name || "Cliente"} · ₡
                {o.total.toLocaleString("es-CR")}
              </strong>
              <p>
                Pedido {o.id} · {statusLabel[o.status]}
              </p>
              <p>
                {o.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
              </p>
              {o.customer?.phone && <p>WhatsApp: {o.customer.phone}</p>}
              {o.status === "PENDING" && (
                <div className={styles.row}>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          "¿Confirmás que el pedido fue pagado y entregado?",
                        )
                      )
                        void run(() =>
                          api(`orders/${o.id}`, "PATCH", {
                            status: "COMPLETED",
                          }),
                        );
                    }}
                  >
                    Pagado y entregado
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          "¿Cancelar y devolver las unidades al inventario?",
                        )
                      )
                        void run(() =>
                          api(`orders/${o.id}`, "PATCH", {
                            status: "CANCELLED",
                          }),
                        );
                    }}
                  >
                    Cancelar pedido
                  </button>
                </div>
              )}
            </article>
          ))}
        </>
      )}
      {tab === "account" && (
        <>
          <h3>Mi acceso personal</h3>
          <p>
            El acceso del salón es personal. El POS se activará después de
            completar su integración en System Lab.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run(async () => {
                await api("auth/password", "POST", {
                  currentPassword: f.get("current"),
                  password: f.get("password"),
                });
                window.location.reload();
              });
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
              Nueva contraseña (12 caracteres como mínimo)
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
              />
            </label>
            <div className={styles.row}>
              <button disabled={busy}>Cambiar y cerrar sesiones</button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
