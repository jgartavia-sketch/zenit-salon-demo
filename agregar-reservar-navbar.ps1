# ZENIT SALON - Agregar Reservar al navbar
# Ejecutar desde la raiz del proyecto:
# powershell -ExecutionPolicy Bypass -File .\agregar-reservar-navbar.ps1

$ErrorActionPreference = "Stop"

function Read-Utf8File {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "No se encontro el archivo: $Path"
    }
    return [System.IO.File]::ReadAllText((Resolve-Path $Path))
}

function Write-Utf8File {
    param(
        [string]$Path,
        [string]$Content
    )
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $utf8NoBom)
}

function Replace-Exact {
    param(
        [string]$Content,
        [string]$Old,
        [string]$New,
        [string]$Label
    )

    if ($Content.Contains($New)) {
        Write-Host "Ya estaba aplicado: $Label" -ForegroundColor DarkGray
        return $Content
    }

    if (-not $Content.Contains($Old)) {
        throw "No encontre el bloque esperado para: $Label. No se modifico ese archivo."
    }

    Write-Host "Aplicando: $Label" -ForegroundColor Cyan
    return $Content.Replace($Old, $New)
}

# ============================================================
# 1) app/page.tsx
# ============================================================

$path = "app/page.tsx"
$content = Read-Utf8File $path

if (-not $content.Contains('const isReserve = pathname === "/reservar";')) {
    $old = '  const isAbout = pathname === "/nosotros" || pathname === "/contacto";'
    $new = $old + [Environment]::NewLine + '  const isReserve = pathname === "/reservar";'
    $content = Replace-Exact -Content $content -Old $old -New $new -Label "estado activo de Reservar en app/page.tsx"
}

$old = @'
          <Link className={isServices ? "active" : ""} href="/servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link className={isAbout ? "active" : ""} href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
'@

$new = @'
          <Link className={isServices ? "active" : ""} href="/servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link className={isReserve ? "active" : ""} href="/reservar" onClick={() => setMenuOpen(false)}>Reservar</Link>
          <Link className={isAbout ? "active" : ""} href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
'@

$content = Replace-Exact -Content $content -Old $old.TrimEnd() -New $new.TrimEnd() -Label "Reservar en navbar principal"

# Corregir enlaces viejos sin depender del simbolo de flecha.
$content = $content -replace 'href="/servicios#solicitar-servicio">Reservar</Link>', 'href="/reservar">Reservar</Link>'
$content = $content -replace 'href="/servicios#solicitar-servicio">Reservar cita', 'href="/reservar">Reservar cita'

Write-Utf8File $path $content

# ============================================================
# 2) app/tienda/page.tsx
# ============================================================

$path = "app/tienda/page.tsx"
$content = Read-Utf8File $path

$old = @'
          <Link className="active" href="/tienda">Tienda</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/nosotros">Nosotros</Link>
'@

$new = @'
          <Link className="active" href="/tienda">Tienda</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/reservar">Reservar</Link>
          <Link href="/nosotros">Nosotros</Link>
'@

$content = Replace-Exact -Content $content -Old $old.TrimEnd() -New $new.TrimEnd() -Label "Reservar en navbar de Tienda"
$content = $content -replace 'href="/servicios#solicitar-servicio"', 'href="/reservar"'

Write-Utf8File $path $content

# ============================================================
# 3) app/servicios/page.tsx
# ============================================================

$path = "app/servicios/page.tsx"
$content = Read-Utf8File $path

$old = @'
          <Link className="active" href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
'@

$new = @'
          <Link className="active" href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link href="/reservar" onClick={() => setMenuOpen(false)}>Reservar</Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
'@

$content = Replace-Exact -Content $content -Old $old.TrimEnd() -New $new.TrimEnd() -Label "Reservar en navbar de Servicios"

Write-Utf8File $path $content

# ============================================================
# 4) app/reservar/page.tsx
# ============================================================

$path = "app/reservar/page.tsx"
$content = Read-Utf8File $path

$old = @'
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>
            Nosotros
          </Link>
'@

$new = @'
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link className="active" href="/reservar" onClick={() => setMenuOpen(false)}>
            Reservar
          </Link>
          <Link href="/nosotros" onClick={() => setMenuOpen(false)}>
            Nosotros
          </Link>
'@

$content = Replace-Exact -Content $content -Old $old.TrimEnd() -New $new.TrimEnd() -Label "Reservar activo en navbar de Reservas"

Write-Utf8File $path $content

# ============================================================
# 5) app/nosotros/page.tsx
# ============================================================

$path = "app/nosotros/page.tsx"
$content = Read-Utf8File $path

$old = @'
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link
            className="active"
            href="/nosotros"
'@

$new = @'
          <Link href="/servicios" onClick={() => setMenuOpen(false)}>
            Servicios
          </Link>
          <Link href="/reservar" onClick={() => setMenuOpen(false)}>
            Reservar
          </Link>
          <Link
            className="active"
            href="/nosotros"
'@

$content = Replace-Exact -Content $content -Old $old.TrimEnd() -New $new.TrimEnd() -Label "Reservar en navbar de Nosotros"

Write-Utf8File $path $content

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host " ZENIT: Reservar agregado al navbar." -ForegroundColor Green
Write-Host " Proba ahora con: npm run dev" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green