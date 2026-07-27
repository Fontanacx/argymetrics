# Download all company logos to public/logos/
# Usage: pwsh scripts/download-logos.ps1

$ErrorActionPreference = "Stop"
$logosDir = "public/logos"
New-Item -ItemType Directory -Path $logosDir -Force | Out-Null
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

# =========================================================================
# SVG logos from simple-icons CDN (vector, infinite quality)
# =========================================================================
$svgLogos = @{
  "aapl"    = "apple"
  "nvda"    = "nvidia"
  "msft"    = "microsoft"
  "samsung" = "samsung"
  "tsla"    = "tesla"
  "spcx"    = "spacex"
  "meli"    = "mercadopago"
}

Write-Host "--- SVG logos (simple-icons) ---" -ForegroundColor Cyan
foreach ($file in $svgLogos.Keys) {
  $icon = $svgLogos[$file]
  $url = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/$icon.svg"
  $out = "$logosDir/$file.svg"
  Invoke-WebRequest -Uri $url -OutFile $out
  Write-Host "  $file.svg <- $icon ($((Get-Item $out).Length) bytes)"
}

# =========================================================================
# High-res PNG logos from CompaniesMarketCap (256px)
# =========================================================================
$cmcLogos = @{
  "ggal"  = "GGAL"
  "ypfd"  = "YPF"
  "pamp"  = "PAM"
  "bma"   = "BMA"
  "cepu"  = "CEPU"
  "loma"  = "LOMA"
  "txar"  = "TX"
  "alua"  = "ALUA.BA"
  "tgsu2" = "TGS"
}

Write-Host "--- PNG logos (CompaniesMarketCap 256px) ---" -ForegroundColor Cyan
foreach ($file in $cmcLogos.Keys) {
  $ticker = $cmcLogos[$file]
  $url = "https://companiesmarketcap.com/img/company-logos/256/$ticker.png"
  $out = "$logosDir/$file.png"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out
    Write-Host "  $file.png <- $ticker ($((Get-Item $out).Length) bytes)"
  } catch {
    Write-Host "  $file.png <- FAILED" -ForegroundColor Red
  }
}

# =========================================================================
# Fallback: icon.horse favicons for any remaining
# =========================================================================
$fallbackLogos = @{
  "mu"   = "micron.com"
  "cres" = "www.cresud.com.ar"
}

Write-Host "--- PNG logos (icon.horse fallback) ---" -ForegroundColor Cyan
foreach ($file in $fallbackLogos.Keys) {
  $domain = $fallbackLogos[$file]
  $url = "https://icon.horse/icon/$domain"
  $out = "$logosDir/$file.png"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out
    Write-Host "  $file.png <- $domain ($((Get-Item $out).Length) bytes)"
  } catch {
    Write-Host "  $file.png <- FAILED" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Done: $((Get-ChildItem $logosDir).Count) logos in $logosDir/" -ForegroundColor Green
