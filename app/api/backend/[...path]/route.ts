import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const sessions = {
  customer: "zenit_session",
  admin: "zenit_owner_session",
  staff: "zenit_staff_session",
};
async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (
    path[0] !== "api" ||
    path.some((x) => !/^[-a-zA-Z0-9_]+$/.test(x)) ||
    path[1] === "pos-connect"
  )
    return NextResponse.json({ error: "Ruta no disponible." }, { status: 404 });
  const route = path.join("/");
  const method = request.method;
  if (
    !["GET", "HEAD"].includes(method) &&
    request.headers.get("origin") !==
      `${request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || request.nextUrl.protocol.slice(0, -1)}://${request.headers.get("host")}`
  )
    return NextResponse.json(
      { error: "Origen no autorizado." },
      { status: 403 },
    );
  const kind =
    path[1] === "staff"
      ? "staff"
      : path[1] === "admin" ||
          path[1] === "uploads" ||
          request.nextUrl.searchParams.get("owner") === "1"
        ? "admin"
        : "customer";
  const cookieName = sessions[kind];
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const token = request.cookies.get(cookieName)?.value;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const base = process.env.ZENIT_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!base)
    return NextResponse.json(
      { error: "El salón debe configurar la conexión del sitio." },
      { status: 503 },
    );
  const url = new URL(base);
  if (
    url.protocol !== "https:" &&
    !(
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    return NextResponse.json(
      { error: "La conexión debe utilizar HTTPS." },
      { status: 503 },
    );
  // Fixed base from server configuration; no upstream URLs or caller Authorization are forwarded.
  url.pathname = `${url.pathname.replace(/\/$/, "")}/${route}`;
  url.search = request.nextUrl.search;
  url.searchParams.delete("owner");
  const length = Number(request.headers.get("content-length") || 0);
  const limit =
    route === "api/uploads/product-image" ? 5 * 1024 * 1024 + 16384 : 102400;
  if (length > limit)
    return NextResponse.json(
      { error: "Solicitud demasiado grande." },
      { status: 413 },
    );
  try {
    let body: Uint8Array | undefined;
    if (!["GET", "HEAD"].includes(method)) {
      const chunks: Uint8Array[] = [];
      let size = 0;
      const reader = request.body?.getReader();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > limit) {
            await reader.cancel();
            return NextResponse.json(
              { error: "Solicitud demasiado grande." },
              { status: 413 },
            );
          }
          chunks.push(value);
        }
      }
      body = new Uint8Array(size);
      let at = 0;
      for (const chunk of chunks) {
        body.set(chunk, at);
        at += chunk.length;
      }
    }
    const upstream = await fetch(url, {
      method,
      headers,
      body: body as BodyInit | undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(25000),
    });
    const data = await upstream.json();
    const response = NextResponse.json(data, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
    if (upstream.headers.get("retry-after"))
      response.headers.set("Retry-After", upstream.headers.get("retry-after")!);
    const authRoute =
      route === "api/auth/login" ||
      route === "api/auth/register" ||
      route === "api/staff/login";
    if (authRoute && upstream.ok && typeof data.token === "string") {
      if (kind === "admin" && data.customer?.role !== "ADMIN")
        return NextResponse.json(
          { error: "Esta cuenta no tiene acceso administrativo." },
          { status: 403 },
        );
      const { token: issued, ...publicData } = data;
      const result = NextResponse.json(publicData, {
        status: upstream.status,
        headers: { "Cache-Control": "no-store" },
      });
      result.cookies.set(cookieName, issued, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: kind === "customer" ? 7 * 86400 : 8 * 3600,
      });
      return result;
    }
    if (
      upstream.status === 401 ||
      route.endsWith("/logout") ||
      (route === "api/auth/password" && upstream.ok)
    )
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    return response;
  } catch {
    const response = NextResponse.json(
      {
        error: "No se pudo conectar con el salón. Reintentá en unos segundos.",
      },
      { status: 502 },
    );
    if (route.endsWith("/logout"))
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    return response;
  }
}
export {
  proxy as GET,
  proxy as POST,
  proxy as PATCH,
  proxy as PUT,
  proxy as DELETE,
};
